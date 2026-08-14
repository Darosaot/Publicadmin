/**
 * Performance reviews, job offers and promotions.
 *
 * Meeting a level's requirements does not hand you the post — it makes you eligible, and an offer
 * still has to materialise. That gap is deliberate: it keeps the climb from feeling like a
 * checklist, and it gives reputation above the bar something to do.
 */

import {
  MINISTER_MIN_POLITICAL_CAPITAL,
  MINISTER_MIN_REPUTATION,
  OFFER_BASE_CHANCE,
  OFFER_CHANCE_PER_REPUTATION_POINT,
  OFFER_EXPIRY_TURNS,
  OFFER_MAX_CHANCE,
  OFFER_SALARY_VARIANCE,
  REVIEW_FAILURE_PENALTY_THRESHOLD,
  REVIEW_INTERVAL,
  REVIEW_OUTCOMES,
} from './constants';
import { adjustStat } from './effects';
import { getCareerLevel, maxCareerLevel, type ContentRegistry } from './registry';
import { nextChance, nextRange } from './rng';
import { refillBoard } from './tasks';
import { setupTeamForLevel } from './team';
import type { GameState, JobOffer, ReviewRating, ReviewReport } from './types';

/** Worst to best, so "drop one band" is a single step down this list. */
const RATING_ORDER: ReviewRating[] = ['concerning', 'adequate', 'solid', 'outstanding'];

export function isReviewDue(state: GameState): boolean {
  return state.turn - state.lastReviewTurn >= REVIEW_INTERVAL;
}

export function ratingForPerformance(performance: number): ReviewRating {
  if (performance >= REVIEW_OUTCOMES.outstanding.minPerformance) return 'outstanding';
  if (performance >= REVIEW_OUTCOMES.solid.minPerformance) return 'solid';
  if (performance >= REVIEW_OUTCOMES.adequate.minPerformance) return 'adequate';
  return 'concerning';
}

export function runReview(state: GameState): { state: GameState; report: ReviewReport } {
  let rating = ratingForPerformance(state.stats.performance);

  if (state.sinceReview.failed >= REVIEW_FAILURE_PENALTY_THRESHOLD) {
    const index = RATING_ORDER.indexOf(rating);
    rating = RATING_ORDER[Math.max(0, index - 1)] ?? 'concerning';
  }

  const outcome = REVIEW_OUTCOMES[rating];
  const salaryDelta = Math.round(state.player.salary * outcome.salaryPct);

  const stats = { ...state.stats };
  adjustStat(stats, 'reputation', outcome.reputation);

  const next: GameState = {
    ...state,
    stats,
    player: { ...state.player, salary: state.player.salary + salaryDelta },
    lastReviewTurn: state.turn,
    sinceReview: { completed: 0, failed: 0 },
  };

  return {
    state: next,
    report: { rating, reputationDelta: outcome.reputation, salaryDelta },
  };
}

/* ------------------------------------------------------------------ offers */

export function meetsRequirements(state: GameState, registry: ContentRegistry, level: number): boolean {
  const target = registry.careerLevels.find((l) => l.level === level);
  if (!target?.promotion) return false;

  const req = target.promotion;
  if (state.stats.reputation < req.minReputation) return false;
  if (state.stats.performance < req.minPerformance) return false;
  if (req.minPoliticalCapital !== undefined && state.stats.politicalCapital < req.minPoliticalCapital) {
    return false;
  }
  if (state.player.turnsAtLevel < req.minTurnsAtLevel) return false;
  return true;
}

export function offerChance(state: GameState, registry: ContentRegistry, level: number): number {
  const target = registry.careerLevels.find((l) => l.level === level);
  if (!target?.promotion) return 0;
  const surplus = state.stats.reputation - target.promotion.minReputation;
  return Math.min(
    OFFER_MAX_CHANCE,
    OFFER_BASE_CHANCE + Math.max(0, surplus) * OFFER_CHANCE_PER_REPUTATION_POINT,
  );
}

/**
 * Rolls for a new offer to the next level up. Returns the new state and any offer created.
 */
export function checkForOffer(
  state: GameState,
  registry: ContentRegistry,
): { state: GameState; offer?: JobOffer } {
  const nextLevel = state.player.level + 1;

  if (nextLevel > maxCareerLevel(registry)) return { state };
  if (state.offers.some((o) => o.toLevel === nextLevel)) return { state };
  if (!meetsRequirements(state, registry, nextLevel)) return { state };

  const roll = nextChance(state.rngState, offerChance(state, registry, nextLevel));
  let next: GameState = { ...state, rngState: roll.rngState };
  if (!roll.value) return { state: next };

  const target = getCareerLevel(registry, nextLevel);
  const jitter = nextRange(next.rngState, -OFFER_SALARY_VARIANCE, OFFER_SALARY_VARIANCE);
  next = { ...next, rngState: jitter.rngState };

  const offer: JobOffer = {
    id: `offer-${nextLevel}-${next.turn}`,
    toLevel: nextLevel,
    salary: Math.round(target.baseSalary * (1 + jitter.value)),
    createdTurn: next.turn,
    expiresTurn: next.turn + OFFER_EXPIRY_TURNS,
  };

  return { state: { ...next, offers: [...next.offers, offer] }, offer };
}

export function expireOffers(state: GameState): GameState {
  const live = state.offers.filter((o) => o.expiresTurn >= state.turn);
  if (live.length === state.offers.length) return state;
  return { ...state, offers: live };
}

/**
 * Takes the job. A new post means a new desk: the old task board does not come with you.
 */
export function acceptOffer(
  state: GameState,
  registry: ContentRegistry,
  offerId: string,
): GameState {
  const offer = state.offers.find((o) => o.id === offerId);
  if (!offer) return state;

  const target = getCareerLevel(registry, offer.toLevel);

  const promoted: GameState = {
    ...state,
    player: {
      ...state.player,
      level: offer.toLevel,
      turnsAtLevel: 0,
      salary: offer.salary,
    },
    tasks: [],
    offers: [],
    log: [
      ...state.log,
      {
        turn: state.turn,
        messageKey: 'log.took_post',
        params: { title: target.titleKey, org: target.orgShortKey },
        tone: 'good',
      },
    ],
  };

  // The unit you inherit comes with the post — or vanishes, if the new post has none.
  return refillBoard(setupTeamForLevel(promoted, registry), registry);
}

export function declineOffer(state: GameState, offerId: string): GameState {
  return { ...state, offers: state.offers.filter((o) => o.id !== offerId) };
}

/* ---------------------------------------------------------------- minister */

/**
 * At the top of the ladder the ladder runs out, and what's left is politics. Meeting the bar sets
 * a flag; the flag makes the confirmation arc's first milestone eligible, and the arc itself
 * decides how it ends.
 */
export function checkMinisterTrack(state: GameState, registry: ContentRegistry): GameState {
  if (state.flags.minister_track) return state;
  if (state.player.level < maxCareerLevel(registry)) return state;
  if (state.stats.reputation < MINISTER_MIN_REPUTATION) return state;
  if (state.stats.politicalCapital < MINISTER_MIN_POLITICAL_CAPITAL) return state;

  return { ...state, flags: { ...state.flags, minister_track: true } };
}
