/**
 * Performance reviews, job offers and promotions.
 *
 * Meeting a level's requirements does not hand you the post — it makes you eligible, and an offer
 * still has to materialise. That gap is deliberate: it keeps the climb from feeling like a
 * checklist, and it gives reputation above the bar something to do.
 */

import {
  KEEP_ON_MOVE_LIMIT,
  LOG_LIMIT,
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
import { outgoingsFor } from './money';
import { displaceRival, fillLapsedPost, postHeld } from './rival';
import { learnLocalBodies } from './world';
import { edgeBetween, getPost, maxTier, postsFrom, type ContentRegistry } from './registry';
import { nextChance, nextRange } from './rng';
import { refillBoard } from './tasks';
import { setupTeamForPost } from './team';
import type {
  GameState,
  JobOffer,
  LogEntry,
  ReviewRating,
  ReviewReport,
  StaffMember,
} from './types';

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
    // Somebody is already sitting there, because you were offered it and let it lapse. It comes
    // back when they move on, which is the whole of what declining now costs.
    if (postHeld(next, candidate.id)) continue;
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

/**
 * Offers you did not take, and what happens to them now.
 *
 * For six versions this dropped them from the array and that was the whole of it: a post you were
 * offered stayed on the tree, available forever, and declining cost you exactly nothing. That is
 * the one place in this game where a decision had no consequence at all.
 *
 * Now somebody else may take it — but only somebody who could actually have got it. `rivalTakesOffer`
 * checks her against the same edge you were checked against, so a post lapses into her hands only
 * when she had the standing and the time in post for it. The alternative would be a game that
 * punishes you for declining by inventing a promotion for somebody who had not earned one.
 */
export function expireOffers(state: GameState, registry: ContentRegistry): GameState {
  const live = state.offers.filter((o) => o.expiresTurn >= state.turn);
  if (live.length === state.offers.length) return state;

  const lapsed = state.offers.filter((o) => o.expiresTurn < state.turn);
  let next: GameState = { ...state, offers: live };

  for (const offer of lapsed) next = fillIt(next, registry, offer);

  return next;
}

/**
 * Takes the job. A new post means a new desk: the old task board does not come with you.
 */
/**
 * What taking this post would cost, without taking it.
 *
 * Pure, and separate from `acceptOffer`, because the player is entitled to know before they
 * decide. The unit is destroyed on every post change and always has been; until now the only
 * notice was a log line *after* the fact, which is not notice.
 */
export interface PostChangePreview {
  /** How many of your unit you may bring. Zero at a post with no unit under it. */
  canKeep: number;
  /** Everybody currently reporting to you. */
  losing: StaffMember[];
  /** True when the destination has no unit at all — the whole office is handed over. */
  handover: boolean;
  /** Initiatives in flight, which do not travel. */
  droppingInitiatives: string[];
}

export function previewPostChange(
  state: GameState,
  registry: ContentRegistry,
  postId: string,
): PostChangePreview {
  const headcount = getPost(registry, postId).headcount ?? 0;

  return {
    canKeep: headcount === 0 ? 0 : Math.min(KEEP_ON_MOVE_LIMIT, state.staff.length),
    losing: state.staff,
    handover: headcount === 0 && state.staff.length > 0,
    droppingInitiatives: state.initiatives.map((i) => i.templateId),
  };
}

export function acceptOffer(
  state: GameState,
  registry: ContentRegistry,
  offerId: string,
  /** Staff ids to bring with you. See `setupTeamForPost`. */
  keep: readonly string[] = [],
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
      // The rent moves with the post. Alderford is not the Ministry, and a career that took the
      // bigger job and kept the smaller life would turn seniority into a money printer — which
      // is exactly what the first draft of this did.
      outgoings: outgoingsFor(target),
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

  // If she was sitting in it, she is not any more. Two people cannot hold one post, and the
  // career screen would otherwise show the player their own job title under somebody else's name.
  const settled = displaceRival(promoted, registry, target.id);

  // You know the building on your first morning in it, not a cycle later. `beginNextTurn` runs
  // this too, but only after a whole cycle has been played, which would show a new arrival their
  // own office as somewhere they had never been.
  const sited = learnLocalBodies(settled, registry);

  // The unit you inherit comes with the post — or is handed over, if the new post has none.
  return refillBoard(setupTeamForPost(sited, registry, keep), registry);
}

/**
 * Turning a post down, which now means somebody else may be doing it.
 *
 * Deliberately the same consequence as letting the offer lapse. A player who declines explicitly
 * and one who lets the three months run out have made the same decision about the same post, and
 * a game that charged only the second would be teaching them to avoid the button rather than the
 * choice.
 */
export function declineOffer(
  state: GameState,
  registry: ContentRegistry,
  offerId: string,
): GameState {
  const offer = state.offers.find((o) => o.id === offerId);
  const without: GameState = { ...state, offers: state.offers.filter((o) => o.id !== offerId) };
  if (!offer) return without;

  return fillIt(without, registry, offer);
}

/** Fills one lapsed or declined post, and names the person if it is somebody you know. */
function fillIt(state: GameState, registry: ContentRegistry, offer: JobOffer): GameState {
  const { state: next, byRival } = fillLapsedPost(state, registry, offer);

  const line: LogEntry = {
    turn: next.turn,
    messageKey: byRival ? 'log.rival_took_post' : 'log.post_filled',
    params: { post: getPost(registry, offer.toPost).titleKey },
    tone: 'bad',
  };
  return { ...next, log: [...next.log, line].slice(-LOG_LIMIT) };
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
