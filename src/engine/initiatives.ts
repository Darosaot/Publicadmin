/**
 * Initiatives: the one thing in the game the player starts rather than receives.
 *
 * Everything else arrives. Files refill by weight, events fire by condition, offers appear when a
 * die says so. An initiative is chosen from a menu, paid for in effort a few points at a time over
 * years, and pays off long after the month it was started in — usually into the country rather
 * than into the player's own numbers.
 *
 * ### Why the memory is a flag and the record is not
 *
 * `GameState.initiatives` holds only what is in flight. On completion the engine writes
 * `init.done.<id>`, on collapse `init.lapsed.<id>`, and drops the record. That split buys three
 * things at once: `requiredFlags` gates follow-on content for free, a thirty-year save never
 * accumulates an archive of finished projects, and `pruneUnknownContent` has one small list to
 * clean rather than a career's worth of history.
 *
 * ### Why progress is capped per cycle
 *
 * `minCycles` exists because the failure mode is obvious otherwise: bank one quiet month, dump
 * twenty points, collect the payoff. Institutions do not move at the speed of your calendar. The
 * cap makes an initiative a commitment — something you have to keep coming back to while the board
 * refills around it — which is the only reason it is interesting to start one.
 */

import {
  INITIATIVE_LAPSE_CYCLES,
  INITIATIVE_SLOTS_BASE,
  INITIATIVE_SLOTS_SENIOR,
  INITIATIVE_SLOTS_SENIOR_TIER,
} from './constants';
import { conditionMet } from './effects';
import type { ContentRegistry } from './registry';
import { findStaff, staffOutput } from './team';
import type {
  ActiveInitiative,
  Allocation,
  Effect,
  GameState,
  InitiativeTemplate,
  LogEntry,
} from './types';
import { initiativeProgressBonus } from './perks';

export function doneFlag(templateId: string): string {
  return `init.done.${templateId}`;
}

export function lapsedFlag(templateId: string): string {
  return `init.lapsed.${templateId}`;
}

/** How many may be in flight at once. */
export function initiativeSlots(state: GameState): number {
  return state.player.level >= INITIATIVE_SLOTS_SENIOR_TIER
    ? INITIATIVE_SLOTS_SENIOR
    : INITIATIVE_SLOTS_BASE;
}

export function isActive(state: GameState, templateId: string): boolean {
  return state.initiatives.some((i) => i.templateId === templateId);
}

/**
 * The most progress one cycle may absorb.
 *
 * At least 1, so a template whose `required` is smaller than its `minCycles` still moves rather
 * than sitting at zero forever and lapsing.
 */
export function cycleCap(template: InitiativeTemplate): number {
  return Math.max(1, Math.ceil(template.required / Math.max(1, template.minCycles)));
}

/**
 * Whether this undertaking can be started right now.
 *
 * A finished one never comes back — that is what makes the menu shrink as a career goes on, and
 * what makes a career's choices visible in what it never got round to. A *lapsed* one is a
 * different matter: dropping something is not the same as it being impossible, so it returns to
 * the menu and content can notice the second attempt through `init.lapsed.<id>`.
 */
export function canStart(state: GameState, template: InitiativeTemplate): boolean {
  if (state.ending) return false;
  if (isActive(state, template.id)) return false;
  if (state.flags[doneFlag(template.id)]) return false;
  if (state.initiatives.length >= initiativeSlots(state)) return false;
  return conditionMet(state, template.available);
}

/** The menu, in content order. */
export function startableInitiatives(
  state: GameState,
  registry: ContentRegistry,
): InitiativeTemplate[] {
  return registry.initiatives.filter((template) => canStart(state, template));
}

export function startInitiative(
  state: GameState,
  registry: ContentRegistry,
  templateId: string,
): GameState {
  const template = registry.initiatives.find((t) => t.id === templateId);
  if (!template || !canStart(state, template)) return state;

  const started: ActiveInitiative = {
    templateId: template.id,
    progress: 0,
    required: template.required,
    startedTurn: state.turn,
    idleCycles: 0,
  };

  return {
    ...state,
    initiatives: [...state.initiatives, started],
    log: [
      ...state.log,
      {
        turn: state.turn,
        messageKey: 'log.initiative_started',
        params: { initiative: template.titleKey },
        tone: 'neutral',
      },
    ],
  };
}

/**
 * Records who is carrying which initiative this cycle.
 *
 * The mirror of `applyAssignments` for the board, and separate from it for the same reason the
 * allocation fields are separate: an unassigned initiative must have its previous carrier cleared,
 * or last month's delegate keeps working on it for free.
 */
export function applyInitiativeAssignments(
  state: GameState,
  allocation: Allocation,
): GameState {
  // Most months of most careers have nothing in flight, and this runs on every one of them.
  // Returning the same state rather than a fresh spread keeps the balance sweep's 25,000 turns
  // from paying for a feature they are not using.
  if (state.initiatives.length === 0) return state;

  const present = new Set(state.staff.map((s) => s.id));

  return {
    ...state,
    initiatives: state.initiatives.map((initiative) => {
      const assignee = allocation.initiativeDelegations[initiative.templateId];
      if (assignee && present.has(assignee)) return { ...initiative, assignedTo: assignee };
      return initiative.assignedTo ? { ...initiative, assignedTo: undefined } : initiative;
    }),
  };
}

export interface InitiativeResult {
  state: GameState;
  completed: string[];
  lapsed: string[];
  /** Payoffs, to be pushed into the turn's single `applyEffects` call rather than applied here. */
  effects: Effect[];
  log: LogEntry[];
}

/**
 * The cycle: effort in, progress out, and the ones that finished or died removed.
 *
 * `share` mirrors the board's rule exactly — someone holding two things splits their month between
 * them. It is computed across files *and* initiatives together, because a person has one month
 * either way and the alternative is a free extra month for anyone given one of each.
 */
export function resolveInitiatives(
  state: GameState,
  registry: ContentRegistry,
  allocation: Allocation,
): InitiativeResult {
  if (state.initiatives.length === 0) {
    return { state, completed: [], lapsed: [], effects: [], log: [] };
  }

  // One month, however many things you are holding — files included.
  const load = new Map<string, number>();
  for (const task of state.tasks) {
    if (task.assignedTo) load.set(task.assignedTo, (load.get(task.assignedTo) ?? 0) + 1);
  }
  for (const initiative of state.initiatives) {
    if (initiative.assignedTo) {
      load.set(initiative.assignedTo, (load.get(initiative.assignedTo) ?? 0) + 1);
    }
  }

  const completed: string[] = [];
  const lapsed: string[] = [];
  const effects: Effect[] = [];
  const log: LogEntry[] = [];
  const surviving: ActiveInitiative[] = [];
  const flags = { ...state.flags };

  for (const initiative of state.initiatives) {
    const template = registry.initiatives.find((t) => t.id === initiative.templateId);

    // A template pulled from the content mid-career: drop the record silently rather than lapse
    // it, since firing an `onLapse` that no longer exists would be worse than forgetting.
    if (!template) continue;

    const own = Math.max(0, allocation.initiativeEffort[initiative.templateId] ?? 0);
    const carrier = initiative.assignedTo ? findStaff(state, initiative.assignedTo) : undefined;
    const delegated = carrier
      ? Math.max(1, Math.round(staffOutput(carrier) / Math.max(1, load.get(carrier.id) ?? 1)))
      : 0;

    const put = Math.min(own + delegated, cycleCap(template));
    // A systems thinker gets more out of each cycle than the points alone would buy.
    const progress = initiative.progress + (put > 0 ? put + initiativeProgressBonus(state) : 0);

    if (progress >= initiative.required) {
      flags[doneFlag(template.id)] = true;
      effects.push(...template.onComplete);
      completed.push(template.id);
      log.push({
        turn: state.turn,
        messageKey: 'log.initiative_complete',
        params: { initiative: template.titleKey },
        tone: 'good',
      });
      continue;
    }

    const idleCycles = put > 0 ? 0 : initiative.idleCycles + 1;

    if (idleCycles >= INITIATIVE_LAPSE_CYCLES) {
      // Progress is forfeit. Half a reform is not half as good as a reform; it is a file nobody
      // will pick up, and the people who backed it noticed you stopped.
      flags[lapsedFlag(template.id)] = true;
      effects.push(...template.onLapse);
      lapsed.push(template.id);
      log.push({
        turn: state.turn,
        messageKey: 'log.initiative_lapsed',
        params: { initiative: template.titleKey },
        tone: 'bad',
      });
      continue;
    }

    surviving.push({ ...initiative, progress, idleCycles });
  }

  return {
    state: { ...state, initiatives: surviving, flags },
    completed,
    lapsed,
    effects,
    log,
  };
}

/**
 * Ends everything in flight, firing `onLapse` for each.
 *
 * Called when the player takes a new post. A new post means a new desk, and an undertaking is
 * bound to the office that started it: the successor inherits the file and not the intent. This is
 * the same rule the board follows, made explicit because an initiative represents years of effort
 * and losing it silently would read as a bug.
 */
export function lapseAllInitiatives(
  state: GameState,
  registry: ContentRegistry,
): { state: GameState; effects: Effect[]; log: LogEntry[] } {
  if (state.initiatives.length === 0) return { state, effects: [], log: [] };

  const effects: Effect[] = [];
  const log: LogEntry[] = [];
  const flags = { ...state.flags };

  for (const initiative of state.initiatives) {
    const template = registry.initiatives.find((t) => t.id === initiative.templateId);
    if (!template) continue;

    flags[lapsedFlag(template.id)] = true;
    effects.push(...template.onLapse);
    log.push({
      turn: state.turn,
      messageKey: 'log.initiative_abandoned',
      params: { initiative: template.titleKey },
      tone: 'bad',
    });
  }

  return { state: { ...state, initiatives: [], flags }, effects, log };
}
