/**
 * What the job pays, and what it costs to have taken it.
 *
 * Salary was a scoreboard for six versions. The design document said stepping onto the expert
 * track "costs money, which is the point" — and money bought nothing, so it cost nothing. Content
 * agreed: `Condition.minSalary` had never once been used in a corpus of two hundred and fifty
 * events, and the `salary` effect had exactly one use in the whole game.
 *
 * Savings make that sentence true. They are what a career puts by after it has lived, and they do
 * two things the game could not previously say:
 *
 * - **Options.** A cushion is what lets you take the sideways move that pays less. That is the
 *   expert fork's whole stated identity and it had no mechanical weight behind it.
 * - **Pressure.** This corpus is full of scenes where somebody offers an official money, and
 *   nobody has ever had a reason to take one. An official who is short is the player these scenes
 *   were written for, and until now the game could not produce one.
 *
 * ### The rule, and why it is absolute
 *
 * **Money never buys reputation or promotion velocity.** It is the same rule perks and
 * initiatives already follow, for the same reason: offers key off reputation and reputation
 * decays every cycle, so anything paying it converts a hoarded resource straight into promotion
 * speed and every career converges on the one build that hoards. Money buys relief and options;
 * its absence buys pressure. `validate.ts` enforces it on content.
 */

import {
  COMFORT_SAVINGS,
  COMFORT_STRESS_RELIEF,
  HARDSHIP_SAVINGS,
  HARDSHIP_STRESS_PER_CYCLE,
  OUTGOINGS_OF_BASE_SALARY,
} from './constants';
import type { GameState, Post } from './types';

/**
 * What a month at this post costs to live.
 *
 * Scaled to the post rather than fixed, because the career already moves you Alderford →
 * Northbridge → the Region → the Agency → the Ministry, and none of those is cheaper than the
 * last. A fixed figure would have made seniority a money printer and the whole system trivial by
 * tier three: the first draft did exactly that, and a Director-General finished with more saved
 * than they had earned in twenty years.
 */
export function outgoingsFor(post: Post): number {
  return Math.round(post.baseSalary * OUTGOINGS_OF_BASE_SALARY);
}

/** What this cycle adds to, or takes out of, what you have put by. */
export function savingsDelta(state: GameState, months: number): number {
  return Math.round((state.player.salary - state.player.outgoings) * months);
}

/** Short. Not a failure state — a pressure, and the one this game had no way to apply. */
export function inHardship(state: GameState): boolean {
  return state.player.savings < HARDSHIP_SAVINGS;
}

/** Enough behind you that the ordinary weight of the job sits a little lighter. */
export function comfortable(state: GameState): boolean {
  return state.player.savings >= COMFORT_SAVINGS;
}

/**
 * What your finances do to your stress this cycle.
 *
 * Deliberately small and deliberately two-sided. Money is not a stress mechanic wearing a hat: it
 * is a state you are in, which the work then happens inside. A player who is comfortable notices
 * nothing much; one who is short notices it every month, which is exactly right.
 */
export function moneyStressDelta(state: GameState): number {
  if (inHardship(state)) return HARDSHIP_STRESS_PER_CYCLE;
  if (comfortable(state)) return -COMFORT_STRESS_RELIEF;
  return 0;
}

/** The band a screen describes rather than scores, the way the People screen already does. */
export function savingsBand(state: GameState): 'short' | 'tight' | 'steady' | 'comfortable' {
  const { savings } = state.player;
  if (savings < HARDSHIP_SAVINGS) return 'short';
  if (savings < state.player.outgoings * 3) return 'tight';
  if (savings < COMFORT_SAVINGS) return 'steady';
  return 'comfortable';
}
