/**
 * What a career remembers about itself.
 *
 * This game covers thirty years and, until v4, could not show you any of them. `log` is capped at
 * sixty lines, `lastReport` holds a single month, and every screen described a present tense. A
 * player could reach retirement without ever having seen the shape of the thing they had just
 * spent an evening playing — no idea when the good years were, when the stress started climbing,
 * or which post was the one that changed everything.
 *
 * So one row per cycle, taken at the moment the cycle closes.
 *
 * ### Why it is not capped
 *
 * Every other array on the state is: `log` at sixty, `alumni` at twelve. Both are windows onto a
 * present — the recent past, the colleagues you might still be able to name — and trimming them
 * costs nothing the player wanted. An arc with the beginning cut off is not an arc, so this one
 * keeps everything. It is bounded anyway by `MAX_TURNS`: a hundred and twenty rows of ten numbers,
 * which is smaller than the event corpus a single save already references by id.
 *
 * ### Why it stores numbers and not snapshots
 *
 * A history is for comparison across time, and anything that cannot be plotted against a turn
 * number does not belong in one. Storing a `GameState` per cycle would be an archive rather than a
 * chart, would multiply the save by a hundred and twenty, and would still not answer the question
 * a player actually has, which is "when did this start going wrong".
 *
 * `postId` is the one non-numeric field, and it earns its place by making a whole second system
 * unnecessary: a post change is a row where it differs from the row before, so the career timeline
 * is derived rather than recorded.
 */

import type { GameState, TurnSample } from './types';

/** Takes the reading for the cycle just closed. */
export function sample(state: GameState): TurnSample {
  return {
    turn: state.turn,
    calendarMonth: state.calendarMonth,
    postId: state.player.postId,
    level: state.player.level,
    reputation: state.stats.reputation,
    performance: state.stats.performance,
    politicalCapital: state.stats.politicalCapital,
    integrity: state.stats.integrity,
    stress: state.stats.stress,
    salary: state.player.salary,
    savings: state.player.savings,
  };
}

/**
 * Appends this cycle's reading, replacing any row already held for the same turn.
 *
 * The replacement matters: `finalizeTurn` can be reached more than once for a single cycle — an
 * event queue that empties, then a milestone that resolves — and a history with the same turn in
 * it twice would put a spike in every chart at the exact moments the game was most interesting.
 */
export function record(state: GameState): GameState {
  const kept = state.history.filter((row) => row.turn !== state.turn);
  return { ...state, history: [...kept, sample(state)] };
}

/** The posts held across a career, in order, with the cycles each one covered. */
export interface PostSpell {
  postId: string;
  fromTurn: number;
  toTurn: number;
  fromMonth: number;
  toMonth: number;
}

/**
 * The career as a sequence of posts rather than of cycles.
 *
 * Derived from the samples rather than recorded alongside them, which is the whole reason
 * `postId` is in the row. A timeline that was maintained separately would be a second source of
 * truth about the same fact, and the two would drift the first time a post change took an unusual
 * path — and this codebase has three documented cases of exactly that.
 */
export function spells(history: readonly TurnSample[]): PostSpell[] {
  const out: PostSpell[] = [];

  for (const row of history) {
    const current = out[out.length - 1];
    if (current && current.postId === row.postId) {
      current.toTurn = row.turn;
      current.toMonth = row.calendarMonth;
      continue;
    }
    out.push({
      postId: row.postId,
      fromTurn: row.turn,
      toTurn: row.turn,
      fromMonth: row.calendarMonth,
      toMonth: row.calendarMonth,
    });
  }

  return out;
}

/** The highest and lowest a series reached, for a chart that has to scale itself. */
export function range(
  history: readonly TurnSample[],
  read: (row: TurnSample) => number,
): { min: number; max: number } {
  if (history.length === 0) return { min: 0, max: 0 };

  let min = Infinity;
  let max = -Infinity;
  for (const row of history) {
    const value = read(row);
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return { min, max };
}
