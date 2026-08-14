/**
 * Reading the clock.
 *
 * `turn` counts decision cycles and `calendarMonth` counts elapsed months, and they are not the
 * same number: a cycle is a month at a junior desk and a quarter in a directorate. Everything that
 * wants to say *when* something happened goes through here, so the UI, the content and the balance
 * report cannot drift apart on it.
 *
 * A career starts in January of its first year, which is a convenience rather than a claim — the
 * setting is fictional and a real date would only invite arithmetic nobody wants to do.
 */

import type { GameState } from './types';

export const MONTHS_PER_YEAR = 12;

/** Years of service, 1-based: the first twelve months are year 1. */
export function serviceYear(state: GameState): number {
  return Math.floor(state.calendarMonth / MONTHS_PER_YEAR) + 1;
}

/** Month within the year, 0-based, for looking up a month name. */
export function monthOfYear(state: GameState): number {
  return state.calendarMonth % MONTHS_PER_YEAR;
}

/**
 * Whole years elapsed. Distinct from `serviceYear` and the one you want when prose says
 * "twenty years ago": at month 11 you are in year 1 but no years have passed.
 */
export function yearsElapsed(state: GameState): number {
  return Math.floor(state.calendarMonth / MONTHS_PER_YEAR);
}
