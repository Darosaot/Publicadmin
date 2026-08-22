/**
 * What the career made of you.
 *
 * The stats panel says how the service currently regards you, and every number on it decays. A
 * perk is the opposite: something learned, kept, and never taken away again. Thirty years in this
 * job should leave a person changed in ways a reputation score cannot express, and until now the
 * only thing a career accumulated was a job title.
 *
 * ### Why these are flags, like directives and the country before them
 *
 * `perk.<id>` is set to 1 when taken. That buys the same four things it bought twice already:
 * `requiredFlags` gates content on a perk for free, `cloneState` already copies it, existing saves
 * are valid without a migration, and no new `Condition` vocabulary is needed. The cost is that
 * nothing type-checks a perk id, which `validate.ts` covers instead.
 *
 * ### Why points are derived and not stored
 *
 * `perkPointsEarned` is a pure function of months served and rank reached, so there is no counter
 * to keep in step with anything. A save from before perks existed reads as "has earned some points
 * and spent none", which is exactly right, and no code path can leak or double-spend a point
 * because there is no balance to corrupt — only a total and a sum of what has been taken.
 *
 * ### Why perks cost their tier
 *
 * A flat cost makes the tree a checklist: take everything in order, and by year thirty every
 * career looks alike. Costing the tier means a full career affords something under half the tree
 * and has to decide what kind of official it became. That is the entire point of having one.
 */

import { flagValue } from './effects';
import type { ContentRegistry } from './registry';
import type { GameState, PerkTemplate } from './types';

/**
 * One point per four years served, plus one for each promotion.
 *
 * Three years was the first draft and it was too generous: the bot finished a career holding
 * roughly six in ten of the tree, and the whole tree's effect on rank cleared the guardrail it is
 * measured against. Four years puts a full career at eleven points against a tree costing thirty,
 * which is the scarcity the design wanted — you become one kind of official, not most of three.
 */
export const PERK_POINT_MONTHS = 48;

export function perkFlag(id: string): string {
  return `perk.${id}`;
}

export function hasPerk(state: GameState, id: string): boolean {
  return flagValue(state, perkFlag(id)) > 0;
}

export function perkCost(perk: PerkTemplate): number {
  return perk.tier;
}

export function perkPointsEarned(state: GameState): number {
  return Math.floor(state.calendarMonth / PERK_POINT_MONTHS) + (state.player.level - 1);
}

export function perkPointsSpent(state: GameState, registry: ContentRegistry): number {
  return registry.perks
    .filter((perk) => hasPerk(state, perk.id))
    .reduce((total, perk) => total + perkCost(perk), 0);
}

export function perkPointsAvailable(state: GameState, registry: ContentRegistry): number {
  return perkPointsEarned(state) - perkPointsSpent(state, registry);
}

export function takenPerks(state: GameState, registry: ContentRegistry): PerkTemplate[] {
  return registry.perks.filter((perk) => hasPerk(state, perk.id));
}

/**
 * Why a perk cannot be taken yet — or `undefined` when it can.
 *
 * Returning the reason rather than a boolean is what lets the character sheet say "needs Mentor
 * first" instead of greying a card out and leaving the player to guess. A tree whose gates are
 * invisible is a tree nobody plans against.
 */
export type PerkBlock = 'taken' | 'requires' | 'level' | 'points';

export function perkBlocker(
  state: GameState,
  registry: ContentRegistry,
  id: string,
): PerkBlock | undefined {
  const perk = registry.perks.find((p) => p.id === id);
  if (!perk) return 'requires';

  if (hasPerk(state, id)) return 'taken';
  if (perk.requires !== undefined && !hasPerk(state, perk.requires)) return 'requires';
  if (state.player.level < perk.minLevel) return 'level';
  if (perkPointsAvailable(state, registry) < perkCost(perk)) return 'points';
  return undefined;
}

export function canTakePerk(state: GameState, registry: ContentRegistry, id: string): boolean {
  return perkBlocker(state, registry, id) === undefined;
}

export function takePerk(state: GameState, registry: ContentRegistry, id: string): GameState {
  if (!canTakePerk(state, registry, id)) return state;
  return { ...state, flags: { ...state.flags, [perkFlag(id)]: 1 } };
}

/* ------------------------------------------------------------------- hooks */

/*
 * Every hook is a plain number added to an existing expression at its call site, in the same
 * shape the directive hooks use. Two rules hold for all of them:
 *
 * - **A perk never multiplies.** Additive bonuses stay legible to the balance sweep and cannot
 *   compound into something nobody predicted at year twenty-eight.
 * - **A perk never pays reputation.** The plan's rule from the initiative work applies with more
 *   force here, because a perk is permanent: offers key off reputation, so anything that adds to
 *   it converts directly into promotion velocity and every career converges on the same build.
 */

const on = (state: GameState, id: string, amount: number): number => (hasPerk(state, id) ? amount : 0);

/**
 * A unit that erodes more slowly, rather than a better one-to-one.
 *
 * The first draft made `open_door` add to `ONE_TO_ONE_MORALE_GAIN`, and the sweep measured it at
 * *minus* 0.2 morale across a career — worse than not having it. The bot only holds a one-to-one
 * when morale has already dropped below a threshold, so a perk that raises morale simply stops it
 * holding them, and the gain is spent keeping the equilibrium where it already was. Any policy a
 * human would recognise does the same thing.
 *
 * Halving the monthly drift cannot be absorbed that way: it applies to everybody, every month,
 * whatever anyone chooses to do. It is also the better fiction — an open door is a thing about the
 * office, not about the meeting.
 */
export function moraleDriftReduction(state: GameState): number {
  return on(state, 'open_door', 1);
}

/** Coaching from somebody who has taught before. */
export function coachingSkillBonus(state: GameState): number {
  return on(state, 'mentor', 3);
}

/** Handing work over stops costing a full point of oversight once you are good at it. */
export function delegationCostReduction(state: GameState): number {
  return on(state, 'delegator', 1);
}

/** People come faster, and arrive keener, to somebody with a reputation for growing them. */
export function hiringMonthsReduction(state: GameState): number {
  return on(state, 'talent_magnet', 1);
}

export function arrivalMoraleBonus(state: GameState): number {
  return on(state, 'talent_magnet', 10);
}

/** An evening off is worth more to somebody who knows how to take one. */
export function restReliefBonus(state: GameState): number {
  return on(state, 'methodical', 1);
}

/** Long undertakings move faster for somebody who can hold a shape in their head for years. */
export function initiativeProgressBonus(state: GameState): number {
  return on(state, 'systems_thinker', 1);
}

/**
 * Standing fades more slowly once enough people remember why you have it.
 *
 * A *reduction in decay* rather than a payment of reputation — deliberately. It cannot be farmed,
 * it does nothing for a career that has not already earned standing, and it does not hand the bot
 * a lump of promotion velocity in the month it is taken.
 */
export function reputationDecayReduction(state: GameState): number {
  // 0.008 against a 0.046 base — a sixth of the fade, not a third. The first draft took a third,
  // and the A/B put the whole tree at +0.39 mean tier against a 0.5 guardrail. Standing is what
  // offers key off, so this is the one hook in the file that converts directly into promotion
  // velocity, and it is deliberately the weakest thing in its branch.
  return on(state, 'institutional_memory', 0.008);
}

/** Work finished by somebody who finishes things. */
export function taskQualityBonus(state: GameState): number {
  return on(state, 'finisher', 2);
}

/** An hour in a corridor is worth more when you know which corridor. */
export function networkingCapitalBonus(state: GameState): number {
  return on(state, 'corridor_sense', 1);
}

/** Money follows people who have defended a budget line before. */
export function budgetBonus(state: GameState): number {
  return on(state, 'budget_hawk', 900);
}

/** The month itself weighs less. */
export function baselineStressReduction(state: GameState): number {
  return on(state, 'thick_skin', 1);
}

export function politicalDecayReduction(state: GameState): number {
  return on(state, 'kingmaker', 0.02);
}
