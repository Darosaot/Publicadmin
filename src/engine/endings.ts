/**
 * How a career stops.
 *
 * Checked at the end of every month in a fixed order — the first match wins — so that a player
 * who is simultaneously burnt out and about to be dismissed gets the more specific, more human
 * ending rather than whichever check happened to run first.
 *
 * The Minister ending is not here: it arrives through the confirmation arc's `endGame` effect,
 * because reaching it is a story the player plays rather than a threshold they cross.
 */

import {
  BURNOUT_STRESS,
  DISGRACE_INTEGRITY,
  DISMISSAL_PERFORMANCE,
  DISMISSAL_REPUTATION,
  HONOURED_RETIREMENT_REPUTATION,
  MAX_TURNS,
} from './constants';
import type { EndingId, GameState } from './types';

export function checkEnding(state: GameState): EndingId | undefined {
  if (state.ending) return state.ending;

  if (state.stats.stress >= BURNOUT_STRESS) return 'burnout';
  if (state.stats.integrity <= DISGRACE_INTEGRITY) return 'disgrace';
  if (
    state.stats.reputation <= DISMISSAL_REPUTATION &&
    state.stats.performance <= DISMISSAL_PERFORMANCE
  ) {
    return 'dismissed';
  }

  if (state.turn >= MAX_TURNS) {
    return state.stats.reputation >= HONOURED_RETIREMENT_REPUTATION
      ? 'retirement_honoured'
      : 'retirement_quiet';
  }

  return undefined;
}

/** Endings the player can be proud of, for the ending screen's framing. */
export function isPositiveEnding(ending: EndingId): boolean {
  return ending === 'minister' || ending === 'retirement_honoured';
}
