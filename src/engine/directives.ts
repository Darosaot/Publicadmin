/**
 * Standing directives: how you run an office, as opposed to what you do this month.
 *
 * Everything else the player decides is a decision about one month. A directive is set once and
 * holds until it is changed — the difference between "I will work late this month" and "we do not
 * work late here". Each is a choice between two defensible ways of running a public office, and
 * neither pole is the right answer.
 *
 * ### Why these are flags and not state
 *
 * They persist across turns, `requiredFlags`/`minFlag` gates content on them for free, `cloneState`
 * already copies them, and adding them needed no save migration. A `directives` record on
 * `GameState` would have bought type safety over three small integers in exchange for a migration,
 * a clone line and a new `Condition` vocabulary — which is the same trade the country declined for
 * the same reasons.
 *
 * A stance of 0 means "no house rule", which is the honest default: most offices have not decided.
 */

import { flagValue } from './effects';
import type { GameState } from './types';

/** 0 = undecided, 1 = the first pole, 2 = the second. */
export type Stance = 0 | 1 | 2;

export function directiveFlag(id: string): string {
  return `directive.${id}`;
}

export function stanceOf(state: GameState, id: string): Stance {
  const raw = flagValue(state, directiveFlag(id));
  return raw === 1 ? 1 : raw === 2 ? 2 : 0;
}

/**
 * `+1` when the office holds `positivePole`, `-1` when it holds the other, `0` for undecided.
 *
 * Every mechanical hook below is a small multiple of this, which keeps the directives symmetrical
 * by construction: it is not possible to write one whose poles are accidentally both a bonus.
 * Naming the positive pole per hook rather than negating the result also keeps `-0` — which is a
 * real value in JavaScript and a silly thing to have to reason about — out of the save file.
 */
function lean(state: GameState, id: string, positivePole: 1 | 2): number {
  const stance = stanceOf(state, id);
  if (stance === 0) return 0;
  return stance === positivePole ? 1 : -1;
}

/* ------------------------------------------------------------------- hours */

/**
 * Absorb the pressure, or pass it down.
 *
 * The clearest trade in the game and the one every manager actually makes: a month's load has to
 * land somewhere. Taking it yourself costs a point of stress a month and buys your people a point
 * of morale; passing it down does exactly the reverse. Over three hundred months either one
 * decides whether you burn out or your unit empties, and a great many real offices run the second
 * way without ever saying so.
 */
export function hoursStressDelta(state: GameState): number {
  // Both halves are inert without a unit, and deliberately so. You cannot absorb your people's
  // pressure when you have no people — and without the gate this is a pure standing cost for the
  // forty months before the first management post, which the balance sweep showed costs a career
  // nine years and reads to the player as a punishment for answering the question early.
  if (state.staff.length === 0) return 0;
  return lean(state, 'hours', 1);
}

export function hoursMoraleDelta(state: GameState): number {
  if (state.staff.length === 0) return 0;
  return lean(state, 'hours', 1);
}

/* ------------------------------------------------------------------ rigour */

/**
 * Document everything, or move fast.
 *
 * Rigour buys quality on what does get finished and costs a point of it in speed — the file takes
 * longer because the note has to be written. Moving fast is the mirror. The effort side is applied
 * in `tasks.ts` at spawn, so it shows on the card rather than surprising the player at the end.
 */
export function rigourQualityDelta(state: GameState): number {
  return lean(state, 'rigour', 1) * 3;
}

export function rigourEffortDelta(state: GameState): number {
  return lean(state, 'rigour', 1);
}

/* ------------------------------------------------------------------ hiring */

/**
 * Hire for potential, or for experience.
 *
 * Potential arrives cheaper and keener and takes years to be worth it; experience arrives able and
 * settled and will not grow much. Both are real recruitment doctrines and both have produced
 * disastrous units.
 */
export function hiringSkillDelta(state: GameState): number {
  return lean(state, 'hiring', 2) * 8;
}

export function hiringMoraleDelta(state: GameState): number {
  return lean(state, 'hiring', 1) * 6;
}
