/**
 * The people who used to work for you.
 *
 * A thirty-year career is largely the people who passed through it, and until now every one of
 * them was destroyed on the next post change with a single log line. They now persist — bounded,
 * named, and carrying what they thought of you when they left.
 *
 * ### The spotlight
 *
 * Event prose can name one of them. `translate` already interpolates `{alum}` and the render path
 * now passes a param bag, so the only thing the engine has to do is say *which* one — which it
 * does with `alum.spotlight`, a **1-based index** into `alumni`, held in `flags` because flags
 * take numbers natively and are already cloned and saved. Zero means nobody, which is what an
 * unset flag reads as, so the default is correct without being written.
 *
 * The 1-based part is the only awkward bit and it is load-bearing: a 0-based index would make
 * "the first alumnus" indistinguishable from "nobody" in a store whose absent value is 0.
 */

import { ALUMNI_LIMIT } from './constants';
import { flagValue } from './effects';
import type { DepartedStaff, GameState, StaffMember } from './types';

export const SPOTLIGHT_FLAG = 'alum.spotlight';

/**
 * What somebody thought of you on the way out, centred on zero.
 *
 * Derived from their morale at the moment they left rather than tracked separately: how a person
 * felt about the job when they left it *is* what they will say about you afterwards, and a second
 * number would only ever drift out of step with the first.
 */
export function regardFrom(member: StaffMember): number {
  return Math.round(member.morale - 50);
}

export function remember(
  state: GameState,
  members: readonly StaffMember[],
  nowAt?: string,
): GameState {
  if (members.length === 0) return state;

  const departed: DepartedStaff[] = members.map((member) => ({
    name: member.name,
    seniority: member.seniority,
    skill: member.skill,
    regard: regardFrom(member),
    leftOnTurn: state.turn,
    ...(nowAt ? { nowAt } : {}),
  }));

  // Oldest first out. Keeping the *most recent* twelve rather than the most fondly remembered is
  // deliberate: the roster is a memory, and memory is chronological rather than sentimental.
  const alumni = [...state.alumni, ...departed].slice(-ALUMNI_LIMIT);

  return { ...state, alumni };
}

/** The alumnus content is currently talking about, if any. */
export function spotlitAlumnus(state: GameState): DepartedStaff | undefined {
  const oneBased = flagValue(state, SPOTLIGHT_FLAG);
  if (oneBased < 1) return undefined;
  return state.alumni[oneBased - 1];
}

/**
 * Points the spotlight at somebody, or at nobody.
 *
 * Called before an event that names an alumnus fires. Picking is the caller's business; all this
 * does is make the choice readable by the render path and by `requiredFlags`.
 */
export function spotlight(state: GameState, index: number | undefined): GameState {
  const value = index === undefined ? 0 : index + 1;
  return { ...state, flags: { ...state.flags, [SPOTLIGHT_FLAG]: value } };
}

/**
 * The one most worth hearing from: highest regard, then most recent.
 *
 * Content that wants "somebody who liked working for you" gets a sensible answer without having
 * to reach into the roster itself.
 *
 * The recency tie-break is `>=` rather than `>` on purpose. Everyone who leaves in the same month
 * shares a `leftOnTurn`, and a whole unit does exactly that on a post change — so with a strict
 * comparison the tie would fall to whoever happened to be first in the roster. Falling through to
 * array position instead keeps "most recent" meaningful, because `remember` appends in order.
 */
export function coldestAlumnus(state: GameState): number | undefined {
  return pickAlumnus(state, (candidate, incumbent) => candidate.regard < incumbent.regard);
}

export function warmestAlumnus(state: GameState): number | undefined {
  return pickAlumnus(state, (candidate, incumbent) => candidate.regard > incumbent.regard);
}

/** Whichever end of the roster `better` asks for, with ties falling to whoever left most recently. */
function pickAlumnus(
  state: GameState,
  better: (candidate: DepartedStaff, incumbent: DepartedStaff) => boolean,
): number | undefined {
  if (state.alumni.length === 0) return undefined;

  let best = 0;
  for (let i = 1; i < state.alumni.length; i += 1) {
    const candidate = state.alumni[i]!;
    const incumbent = state.alumni[best]!;
    if (
      better(candidate, incumbent) ||
      (candidate.regard === incumbent.regard && candidate.leftOnTurn >= incumbent.leftOnTurn)
    ) {
      best = i;
    }
  }
  return best;
}
