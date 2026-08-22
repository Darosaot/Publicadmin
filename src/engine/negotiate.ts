/**
 * Pushing back.
 *
 * The original design note for this game said its missing verb was self-directed action: work
 * arrives, offers arrive, and the only decision left is how to spend a month absorbing it. You
 * could not request a file, refuse one, scope one, or argue about a deadline — which is a strange
 * omission, because arguing about deadlines is most of what the job actually is.
 *
 * These are the three things a real official does with a file they cannot deliver as specified,
 * in roughly ascending order of how much it costs them.
 *
 * ### Why the currency is political capital
 *
 * Because that is what it is. Political capital is defined as favours owed to you and people who
 * take your call, and getting a deadline moved is precisely spending one of those. Paying in
 * effort would make this another way to do the work; paying in reputation would make it a public
 * failure, which refusing a file is and moving a date is not.
 *
 * ### Why each is allowed once per file
 *
 * Without a cap, pushing a deadline is an infinite loop against a decaying but replenishing stat,
 * and no file need ever be finished. Once each also matches the fiction: you can go back to the
 * same person about the same file one time.
 */

import { REFUSE_PC_COST, REFUSE_REPUTATION_COST, SCOPE_PC_COST } from './constants';
import { adjustStat } from './effects';
import type { ContentRegistry } from './registry';
import type { ActiveTask, GameState } from './types';

/** Turns bought by one conversation about the date. */
export const EXTENSION_TURNS = 2;
/** How much of a file remains after it is cut back to what is actually needed. */
export const SCOPE_FACTOR = 0.6;
/** A scoped file cannot come back excellent, however well it is then done. */
export const SCOPED_QUALITY_CAP = 74;

export type NegotiationKind = 'extend' | 'scope' | 'refuse';

/**
 * What one of these costs, in political capital.
 *
 * Scales with what is left of the file: moving the date on something barely started is a bigger
 * ask than moving it on something nearly done, because everybody can see the difference.
 *
 * Priced up once. The first draft charged six for a scope and four to ten for an extension, and
 * the sweep put the bot at ninety-nine per cent completion for eight hundredths of a tier — which
 * makes an oversubscribed board, the thing the whole game is built on, into a solvable one. These
 * verbs are meant to be how you survive a bad month, not how you stop having them.
 */
export function negotiationCost(task: ActiveTask, kind: NegotiationKind): number {
  const outstanding = Math.max(0, task.required - task.progress) / Math.max(1, task.required);

  if (kind === 'extend') return Math.max(5, Math.round(6 + outstanding * 8));
  if (kind === 'scope') return SCOPE_PC_COST;
  return REFUSE_PC_COST;
}

export function canNegotiate(
  state: GameState,
  registry: ContentRegistry,
  taskUid: string,
  kind: NegotiationKind,
): boolean {
  const task = state.tasks.find((t) => t.uid === taskUid);
  if (!task) return false;

  /*
   * A crisis can be argued about, but not away.
   *
   * You may always ask for more time — that is what everybody does, and it is priced. You may not
   * decline it and you may not agree to do less of it, because a crisis you can hand back is not
   * a crisis, and the whole reason it is on the board is that somebody has to deal with it.
   */
  const template = registry.tasks[task.templateId];
  if (template?.crisis && kind !== 'extend') return false;

  if (kind === 'extend' && task.extended) return false;
  if (kind === 'scope' && task.scoped) return false;

  return state.stats.politicalCapital >= negotiationCost(task, kind);
}

/** Move the date. The file is unchanged; you simply have longer, and somebody remembers asking. */
export function extendDeadline(
  state: GameState,
  registry: ContentRegistry,
  taskUid: string,
): GameState {
  if (!canNegotiate(state, registry, taskUid, 'extend')) return state;
  const task = state.tasks.find((t) => t.uid === taskUid)!;

  const next: GameState = {
    ...state,
    stats: { ...state.stats },
    tasks: state.tasks.map((t) =>
      t.uid === taskUid
        ? { ...t, deadlineTurn: t.deadlineTurn + EXTENSION_TURNS, extended: true }
        : t,
    ),
  };
  adjustStat(next.stats, 'politicalCapital', -negotiationCost(task, 'extend'));
  return next;
}

/**
 * Cut it back to what is actually needed.
 *
 * The file shrinks and so does the ceiling on it: a scoped piece of work can be finished well and
 * cannot be finished brilliantly, because part of what would have made it brilliant is the part
 * you agreed not to do.
 */
export function scopeDown(
  state: GameState,
  registry: ContentRegistry,
  taskUid: string,
): GameState {
  if (!canNegotiate(state, registry, taskUid, 'scope')) return state;
  const task = state.tasks.find((t) => t.uid === taskUid)!;

  const next: GameState = {
    ...state,
    stats: { ...state.stats },
    tasks: state.tasks.map((t) =>
      t.uid === taskUid
        ? {
            ...t,
            // Never below what has already been put in, or scoping would finish a file outright.
            required: Math.max(t.progress + 1, Math.round(t.required * SCOPE_FACTOR)),
            scoped: true,
          }
        : t,
    ),
  };
  adjustStat(next.stats, 'politicalCapital', -negotiationCost(task, 'scope'));
  return next;
}

/**
 * Say no.
 *
 * The file leaves the board and does not count as failed — you did not miss it, you declined it,
 * and those are different things that cost different amounts. It is the only one of the three
 * that costs reputation, because it is the only one anybody outside the conversation hears about.
 */
export function refuseTask(
  state: GameState,
  registry: ContentRegistry,
  taskUid: string,
): GameState {
  if (!canNegotiate(state, registry, taskUid, 'refuse')) return state;
  const task = state.tasks.find((t) => t.uid === taskUid);
  if (!task) return state;

  const template = registry.tasks[task.templateId];
  const next: GameState = {
    ...state,
    stats: { ...state.stats },
    tasks: state.tasks.filter((t) => t.uid !== taskUid),
    log: [
      ...state.log,
      {
        turn: state.turn,
        messageKey: 'log.refused_file',
        params: { title: template ? template.titleKey : task.templateId },
        tone: 'bad' as const,
      },
    ],
  };
  adjustStat(next.stats, 'politicalCapital', -negotiationCost(task, 'refuse'));
  adjustStat(next.stats, 'reputation', -REFUSE_REPUTATION_COST);
  return next;
}
