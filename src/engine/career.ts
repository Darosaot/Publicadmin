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
import { edgeBetween, getPost, maxTier, postsFrom, type ContentRegistry } from './registry';
import { nextChance, nextRange } from './rng';
import { refillBoard } from './tasks';
import { setupTeamForPost } from './team';
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

/** Whether the player qualifies for one particular move out of their current post. */
export function meetsRequirements(
  state: GameState,
  registry: ContentRegistry,
  toPostId: string,
): boolean {
  const edge = edgeBetween(registry, state.player.postId, toPostId);
  if (!edge) return false;

  const req = edge.requires;
  if (state.stats.reputation < req.minReputation) return false;
  if (state.stats.performance < req.minPerformance) return false;
  if (req.minPoliticalCapital !== undefined && state.stats.politicalCapital < req.minPoliticalCapital) {
    return false;
  }
  if (state.player.turnsAtLevel < req.minTurnsAtLevel) return false;
  return true;
}

export function offerChance(
  state: GameState,
  registry: ContentRegistry,
  toPostId: string,
): number {
  const edge = edgeBetween(registry, state.player.postId, toPostId);
  if (!edge) return 0;
  const surplus = state.stats.reputation - edge.requires.minReputation;
  return Math.min(
    OFFER_MAX_CHANCE,
    OFFER_BASE_CHANCE + Math.max(0, surplus) * OFFER_CHANCE_PER_REPUTATION_POINT,
  );
}

/**
 * Rolls for a new offer.
 *
 * The ladder is a graph, so there is rarely one next post: an eligible Senior Officer might be
 * offered a unit to run, a specialist post with no unit at all, a seat in a private office or a
 * move into the audit authority. Each edge is rolled separately and each can produce a live offer,
 * so a fork arrives as a genuine choice on the career screen rather than as a single yes/no.
 *
 * Only one new offer is created per cycle, though. Being handed four posts in one month would read
 * as a lottery rather than a career.
 */
export function checkForOffer(
  state: GameState,
  registry: ContentRegistry,
): { state: GameState; offer?: JobOffer } {
  let next: GameState = state;

  for (const candidate of postsFrom(registry, state.player.postId)) {
    if (next.offers.some((o) => o.toPost === candidate.id)) continue;
    if (!meetsRequirements(next, registry, candidate.id)) continue;

    const roll = nextChance(next.rngState, offerChance(next, registry, candidate.id));
    next = { ...next, rngState: roll.rngState };
    if (!roll.value) continue;

    const jitter = nextRange(next.rngState, -OFFER_SALARY_VARIANCE, OFFER_SALARY_VARIANCE);
    next = { ...next, rngState: jitter.rngState };

    const edge = edgeBetween(registry, next.player.postId, candidate.id);
    const offer: JobOffer = {
      id: `offer-${candidate.id}-${next.turn}`,
      toPost: candidate.id,
      toTier: candidate.tier,
      ...(edge?.sideways ? { sideways: true } : {}),
      salary: Math.round(candidate.baseSalary * (1 + jitter.value)),
      createdTurn: next.turn,
      expiresTurn: next.turn + OFFER_EXPIRY_TURNS,
    };

    return { state: { ...next, offers: [...next.offers, offer] }, offer };
  }

  return { state: next };
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

  const target = getPost(registry, offer.toPost);

  const promoted: GameState = {
    ...state,
    player: {
      ...state.player,
      postId: target.id,
      level: target.tier,
      track: target.track,
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

  // The unit you inherit comes with the post — or is handed over, if the new post has none.
  return refillBoard(setupTeamForPost(promoted, registry), registry);
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
  if (state.player.level < maxTier(registry)) return state;
  if (state.stats.reputation < MINISTER_MIN_REPUTATION) return state;
  if (state.stats.politicalCapital < MINISTER_MIN_POLITICAL_CAPITAL) return state;

  return { ...state, flags: { ...state.flags, minister_track: true } };
}
