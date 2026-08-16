/**
 * The country, and how it moves.
 *
 * The player works inside one institution at a time, but the others carry on — getting slowly
 * better or, more often, slowly worse, on their own schedule, whether or not anybody is looking at
 * them. That is the whole of this module: a place has a condition, the condition moves every
 * month, and what the player does to it stays done.
 *
 * ### Where the numbers live
 *
 * In `flags`, as **deviation from the body's founding condition**, because `flagValue` reads an
 * unset flag as 0 and "nobody has touched this place" is exactly what 0 should mean. Three
 * consequences, all of them good:
 *
 * - the country needed no save migration to exist, and old careers are already correct;
 * - `cloneState` needed no edit, so it cannot be the source of the trap it documents;
 * - content gates on a body with `minFlag`/`maxFlag` and no new `Condition` surface at all.
 *
 * ### Why there is no mean reversion
 *
 * An earlier draft pulled every body back toward its baseline, so improvements decayed without
 * maintenance. It simulates entropy nicely and it plays terribly: the one thing a thirty-year
 * career should leave behind is a mark, and a mark that fades is a mark you did not make. Drift is
 * therefore one-directional and the player's changes are permanent. Places get worse on their own;
 * they get better only because somebody did something.
 */

import { STAT_MAX, STAT_MIN } from './constants';
import { flagValue } from './effects';
import type { ContentRegistry } from './registry';
import type { GameState, WorldBody } from './types';

export function conditionFlag(bodyId: string): string {
  return `body.${bodyId}.cond`;
}

export function standingFlag(bodyId: string): string {
  return `body.${bodyId}.stand`;
}

export function knownFlag(bodyId: string): string {
  return `body.${bodyId}.known`;
}

/** How well this place is actually run, 0–100. */
export function bodyCondition(state: GameState, body: WorldBody): number {
  const moved = body.baselineCondition + flagValue(state, conditionFlag(body.id));
  return Math.max(STAT_MIN, Math.min(STAT_MAX, moved));
}

/**
 * How it regards you.
 *
 * Centred on zero rather than fifty, matching the cast: institutions, like people, start with no
 * opinion of you at all.
 */
export function bodyStanding(state: GameState, body: WorldBody): number {
  return flagValue(state, standingFlag(body.id));
}

/** Whether the player has ever actually looked at this place. */
export function bodyKnown(state: GameState, body: WorldBody): boolean {
  return Boolean(state.flags[knownFlag(body.id)]);
}

/**
 * Moves every body on by the months just worked.
 *
 * Called from `beginNextTurn` with that post's `monthsPerTurn`, so a Director-General's cycle moves
 * the country half a year and a junior's moves it one month. The world does not run faster for
 * senior players; it is simply that more of it happens between their decisions.
 *
 * Deterministic: no RNG here. The country's own tendencies are a property of the country, and
 * making them random would mean two careers with the same seed could not be compared — which is
 * the whole basis of the balance harness.
 */
export function driftWorld(
  state: GameState,
  registry: ContentRegistry,
  months: number,
): GameState {
  if (months <= 0 || registry.bodies.length === 0) return state;

  const flags = { ...state.flags };

  for (const body of registry.bodies) {
    if (body.drift === 0) continue;

    const flag = conditionFlag(body.id);
    const moved = flagValue(state, flag) + body.drift * months;

    // Deviation is clamped so that the condition it implies stays inside 0–100, rather than
    // letting a body rot to -400 and need four hundred points of work to show any change.
    const floor = STAT_MIN - body.baselineCondition;
    const ceiling = STAT_MAX - body.baselineCondition;
    flags[flag] = Math.max(floor, Math.min(ceiling, moved));
  }

  return { ...state, flags };
}

/**
 * Marks the bodies on the player's own beat as known.
 *
 * You do not need to go looking for the institutions your department deals with every week — you
 * already know what state they are in, because dealing with them is the job. Every department has
 * at least one body on its beat (`validate.ts` enforces it), so this is also what guarantees the
 * Country screen has something on it from the first month rather than staying empty until the
 * player happens to take the right initiative.
 *
 * Everything beyond your own beat has to be gone and looked at.
 */
export function learnLocalBodies(state: GameState, registry: ContentRegistry): GameState {
  const local = registry.bodies.filter(
    (body) => body.beat === state.player.department && !bodyKnown(state, body),
  );
  if (local.length === 0) return state;

  const flags = { ...state.flags };
  for (const body of local) flags[knownFlag(body.id)] = true;
  return { ...state, flags };
}

/** Bodies the player has looked at, worst first — the order a Country screen wants. */
export function knownBodies(state: GameState, registry: ContentRegistry): WorldBody[] {
  return registry.bodies
    .filter((body) => bodyKnown(state, body))
    .sort((a, b) => bodyCondition(state, a) - bodyCondition(state, b));
}
