/**
 * Drawing events and resolving the player's choices.
 *
 * Three kinds of event reach the player, and they are selected in strict priority order so that
 * scripted story beats are never crowded out by random colour:
 *
 *   1. follow-ups scheduled by an earlier decision or a failed task
 *   2. at most one milestone the career system has made eligible
 *   3. random events drawn by weight from the pool matching this department and level
 */

import { coldestAlumnus, spotlight, warmestAlumnus } from './alumni';
import { MAX_EVENTS_PER_TURN, RANDOM_EVENT_COOLDOWN, SECOND_EVENT_CHANCE } from './constants';
import { applyEffects, conditionMet } from './effects';
import type { ContentRegistry } from './registry';
import { nextChance, weightedPick, weightedSample } from './rng';
import type { Choice, GameEvent, GameState, Outcome, PendingEvent } from './types';

export function isOnCooldown(state: GameState, event: GameEvent): boolean {
  const readyTurn = state.cooldowns[event.id];
  return readyTurn !== undefined && state.turn < readyTurn;
}

export function hasFired(state: GameState, eventId: string): boolean {
  return state.firedEvents.includes(eventId);
}

/**
 * Whether there is anybody for this event's prose to be about.
 *
 * An event that names a former colleague cannot fire before there is one. Prose with an empty
 * `{alum}` in it reads as a sentence with a hole, which is worse than an event that waits.
 */
function hasSomebodyToName(state: GameState, event: GameEvent): boolean {
  if (event.namesAlumnus === undefined) return true;
  return aimAt(state, event) !== undefined;
}

/** Which alumnus this event is about, if any. */
function aimAt(state: GameState, event: GameEvent): number | undefined {
  if (event.namesAlumnus === 'cold') return coldestAlumnus(state);
  if (event.namesAlumnus === 'warm') return warmestAlumnus(state);
  return undefined;
}

export function eligibleRandomEvents(state: GameState, registry: ContentRegistry): GameEvent[] {
  return Object.values(registry.events).filter((event) => {
    if (event.kind !== 'random') return false;
    if (event.once && hasFired(state, event.id)) return false;
    if (isOnCooldown(state, event)) return false;
    if (!hasSomebodyToName(state, event)) return false;
    return conditionMet(state, event.conditions);
  });
}

export function eligibleMilestones(state: GameState, registry: ContentRegistry): GameEvent[] {
  return Object.values(registry.events).filter((event) => {
    if (event.kind !== 'milestone') return false;
    if (hasFired(state, event.id)) return false;
    if (!hasSomebodyToName(state, event)) return false;
    return conditionMet(state, event.conditions);
  });
}

/**
 * Assembles this turn's events and records the bookkeeping (fired list, cooldowns) that stops
 * them repeating. Returns a new state with `pendingEvents` populated.
 */
export function drawEvents(state: GameState, registry: ContentRegistry): GameState {
  let next = state;
  const chosen: GameEvent[] = [];

  // 1. Follow-ups that came due. These are consequences; they always get through.
  const due = next.scheduledEvents.filter((s) => s.onTurn <= next.turn);
  const stillScheduled = next.scheduledEvents.filter((s) => s.onTurn > next.turn);
  for (const item of due) {
    const event = registry.events[item.eventId];
    if (event && chosen.length < MAX_EVENTS_PER_TURN) chosen.push(event);
  }
  next = { ...next, scheduledEvents: stillScheduled };

  // 2. At most one milestone.
  if (chosen.length < MAX_EVENTS_PER_TURN) {
    const milestones = eligibleMilestones(next, registry);
    const roll = weightedPick(next.rngState, milestones, (e) => e.weight);
    next = { ...next, rngState: roll.rngState };
    if (roll.value) chosen.push(roll.value);
  }

  // 3. Random colour: one guaranteed, a second now and then.
  const wantSecond = nextChance(next.rngState, SECOND_EVENT_CHANCE);
  next = { ...next, rngState: wantSecond.rngState };
  const randomWanted = 1 + (wantSecond.value ? 1 : 0);
  const randomSlots = Math.min(randomWanted, MAX_EVENTS_PER_TURN - chosen.length);

  if (randomSlots > 0) {
    const pool = eligibleRandomEvents(next, registry).filter(
      (e) => !chosen.some((c) => c.id === e.id),
    );
    const sample = weightedSample(next.rngState, pool, (e) => e.weight, randomSlots);
    next = { ...next, rngState: sample.rngState };
    chosen.push(...sample.value);
  }

  const firedEvents = [...next.firedEvents];
  const cooldowns = { ...next.cooldowns };
  for (const event of chosen) {
    if (!firedEvents.includes(event.id)) firedEvents.push(event.id);
    if (event.kind === 'random') {
      cooldowns[event.id] = next.turn + (event.cooldown ?? RANDOM_EVENT_COOLDOWN);
    }
  }

  // Point the spotlight before the prose is rendered. Only one event a month may name somebody —
  // two would be pointing at the same person or fighting over the flag — so the first that asks
  // for one gets it, and the rest were made ineligible above if there was nobody to ask for.
  const naming = chosen.find((event) => event.namesAlumnus !== undefined);
  next = spotlight(next, naming ? aimAt(next, naming) : undefined);

  const pendingEvents: PendingEvent[] = chosen.map((event) => ({ eventId: event.id }));

  return { ...next, firedEvents, cooldowns, pendingEvents };
}

/* ---------------------------------------------------------------- choices */

export function isChoiceAvailable(state: GameState, choice: Choice): boolean {
  return conditionMet(state, choice.conditions);
}

/**
 * Rolls one of a choice's outcomes, considering only those whose conditions the current state
 * satisfies. If conditions have excluded everything — which content validation is supposed to
 * prevent — the full list is used rather than leaving the player with no outcome at all.
 */
export function rollOutcome(
  state: GameState,
  outcomes: readonly Outcome[],
): { outcome: Outcome | undefined; index: number; rngState: number } {
  const eligible = outcomes.filter((o) => conditionMet(state, o.conditions));
  const pool = eligible.length > 0 ? eligible : outcomes;

  const roll = weightedPick(state.rngState, pool, (o) => o.weight);
  return {
    outcome: roll.value,
    index: roll.value ? outcomes.indexOf(roll.value) : -1,
    rngState: roll.rngState,
  };
}

/**
 * Resolves the player's decision on the event at the front of the queue: rolls one of the
 * choice's weighted outcomes, applies its effects, and stores the outcome text for display.
 */
export function applyChoice(
  state: GameState,
  registry: ContentRegistry,
  eventId: string,
  choiceId: string,
): GameState {
  const pending = state.pendingEvents[0];
  if (!pending || pending.eventId !== eventId || pending.resolution) return state;

  const event = registry.events[eventId];
  if (!event) return state;

  const choice = event.choices.find((c) => c.id === choiceId);
  if (!choice || !isChoiceAvailable(state, choice)) return state;

  const roll = rollOutcome(state, choice.outcomes);
  if (!roll.outcome) return state;

  let next: GameState = { ...state, rngState: roll.rngState };
  next = applyEffects(next, roll.outcome.effects, registry);

  const resolution = {
    choiceId,
    outcomeIndex: roll.index,
    textKey: roll.outcome.textKey,
  };

  // The game may have ended inside those effects; keep the resolution visible either way.
  const pendingEvents = next.pendingEvents.map((p, i) =>
    i === 0 ? { ...p, resolution } : p,
  );

  return { ...next, pendingEvents };
}

/** Removes the resolved event at the front of the queue. */
export function popResolvedEvent(state: GameState): GameState {
  if (state.pendingEvents.length === 0) return state;
  return { ...state, pendingEvents: state.pendingEvents.slice(1) };
}
