/**
 * Elena Vásquez's career, running alongside yours.
 *
 * The design document has called her "the control group for your career" since the cast was
 * written, and for six versions that was a claim the game made and never checked. She was three
 * authored scenes and a `rel.vasquez` flag: prose asserting somebody was keeping pace with you,
 * with nothing behind the assertion. Every scene where she had done well had been written on the
 * assumption she had, and the game had no opinion either way.
 *
 * She is now a second token on the same board. This module moves her with the same helpers the
 * player's own offers come from — `postsFrom`, `edgeBetween` — and holds her to the same
 * `PromotionRequirement` written on the same edges. That is the whole design: when she turns up
 * running a directorate, it is because she met the terms on that edge, and the player can look at
 * the career screen and see which one.
 *
 * ### What she costs the player
 *
 * `rivalTakesOffer` is the point of the feature. Before it, an offer expiring cost you exactly
 * nothing: `expireOffers` dropped it from the array and the post stayed available forever. Now a
 * post you were offered and did not take can be gone when you look again, because somebody who
 * started the same week as you took it. A door you left open closes.
 *
 * It closes for `RIVAL_HOLDS_POST_TURNS` rather than for good. Permanent closure is a much
 * harsher game than this one is tuned to be, and the sweep says so immediately: mean level
 * collapses, because the bot declines offers it cannot yet afford to take and then never sees
 * them again.
 *
 * ### Why she has one stat
 *
 * She has to be cheap enough to simulate every cycle for thirty years and legible enough that a
 * player can reason about her. A full stat block is neither. `standing` is what anybody outside
 * her own office would know about her, and the edges are asked to read it three times — for
 * reputation, for performance, for political capital — because from the outside those are one
 * thing.
 */

import {
  RIVAL_CEILING_MAX,
  RIVAL_CEILING_MIN,
  RIVAL_HOLDS_POST_TURNS,
  RIVAL_MIN_MONTHS_TO_MOVE,
  RIVAL_OFFER_CHANCE,
  RIVAL_GONE_FLAG,
  RIVAL_RESIGN_CHANCE,
  RIVAL_STALL_LEVEL,
  RIVAL_STALL_MONTHS,
  RIVAL_STANDING_DRIFT,
  RIVAL_STANDING_ON_PROMOTION,
  RIVAL_STARTING_STANDING,
  STAT_MAX,
  STAT_MIN,
} from './constants';
import { nextChance, nextInt } from './rng';
import { getPost, postsFrom, startingPost, type ContentRegistry } from './registry';
import type { GameState, JobOffer, Post, PostEdge, RivalState } from './types';

/** Where the engine records that somebody else is sitting in a post. */
export function heldFlag(postId: string): string {
  return `post.${postId}.held`;
}

/**
 * The gap between her tier and yours: positive means she is ahead.
 *
 * One number covers every scene worth writing about the two of you — she is your director now,
 * you are hers, you started together and you are still level — which is why `Condition` gates on
 * this rather than on her absolute tier. Reads 0 once she has left, because a career that ended
 * is not a career you are behind.
 */
export function rivalGap(state: GameState): number {
  if (!state.rival || state.rival.left) return 0;
  return state.rival.level - state.player.level;
}

/** Her post, or undefined if she has none — she may predate the feature, or have gone. */
export function rivalPost(state: GameState, registry: ContentRegistry): Post | undefined {
  if (!state.rival) return undefined;
  return registry.posts.find((p) => p.id === state.rival?.postId);
}

/**
 * A career for her, rolled once.
 *
 * The ceiling band is deliberately wide. On a low roll you outgrow her by year ten and the late
 * scenes are about what that does to somebody who did not; on a high roll she is your director
 * and they are about what that does to you. Both are worth playing, and a narrow band would mean
 * every career got the same one.
 */
export function createRival(
  rngState: number,
  registry: ContentRegistry,
): { rival: RivalState; rngState: number } {
  const start = startingPost(registry);
  const roll = nextInt(rngState, RIVAL_CEILING_MIN, RIVAL_CEILING_MAX);

  return {
    rival: {
      postId: start.id,
      level: start.tier,
      track: start.track,
      standing: RIVAL_STARTING_STANDING,
      ceiling: roll.value,
      monthsInPost: 0,
    },
    rngState: roll.rngState,
  };
}

/**
 * What one edge asks of somebody, read against her single number.
 *
 * The same `PromotionRequirement` the player is held to. Political capital is asked of it too:
 * she has allies in proportion to how well she is thought of, and inventing a second hidden stat
 * to say so would be two numbers that could only ever drift apart.
 */
function barFor(edge: PostEdge): number {
  return Math.max(
    edge.requires.minReputation,
    edge.requires.minPerformance,
    edge.requires.minPoliticalCapital ?? 0,
  );
}

/**
 * Whether she could make this move from where she actually is, on the terms written on the edge.
 *
 * This is her ordinary progression, and it is strict: she walks the graph exactly as the player
 * does, one edge at a time, from her own post.
 */
function qualifies(rival: RivalState, target: Post, fromPost: Post): boolean {
  const edge = target.from.find((e) => e.from === rival.postId);
  if (!edge) return false;
  if (rival.standing < barFor(edge)) return false;

  // Her time in post, measured in her own cycles — a private office turns over faster than a
  // directorate, and the requirement is written in cycles for both of them.
  return rival.monthsInPost >= edge.requires.minTurnsAtLevel * fromPost.monthsPerTurn;
}

/**
 * Whether she is a plausible appointment to a post *you* were offered.
 *
 * Deliberately laxer than `qualifies`, and the first version's failure to be so is why the whole
 * feature did nothing: it asked for an edge running from her own desk to the post you turned
 * down, and she is almost never standing on the desk you are. Across two hundred and ten
 * simulated careers she took exactly zero posts, which is machinery with no mechanic behind it —
 * the same shape of failure as an `{alum}` channel no event names.
 *
 * A post being filled by somebody else does not require them to have come by your route. So she
 * is judged on the *easiest* way into it, and held to two things only: she cannot leap more than
 * one rung, and she has to have been somewhere long enough to be moving at all.
 */
function couldFill(rival: RivalState, target: Post): boolean {
  if (target.id === rival.postId) return false;
  // A step up or a step across, never down, and never a leap.
  if (target.tier > rival.level + 1 || target.tier < rival.level) return false;
  if (rival.monthsInPost < RIVAL_MIN_MONTHS_TO_MOVE) return false;
  if (target.from.length === 0) return false;

  return rival.standing >= Math.min(...target.from.map(barFor));
}

/**
 * Moves her on by one of the player's cycles.
 *
 * Called from `beginNextTurn`, after the world has drifted, so that a Director-General's six
 * months move her six months too. She does not run on the player's clock — she runs on the
 * calendar, and the player's clock only decides how often anyone looks.
 */
export function advanceRival(state: GameState, registry: ContentRegistry): GameState {
  const rival = state.rival;
  if (!rival || rival.left) return state;

  const post = getPost(registry, state.player.postId);
  const months = post.monthsPerTurn;

  let rngState = state.rngState;
  const next: RivalState = { ...rival, monthsInPost: rival.monthsInPost + months };

  // She converges on how good she actually is rather than climbing forever. Without this every
  // career ends with Elena in the Council of Ministers, which is not a control group.
  next.standing = clampStanding(
    next.standing + (next.ceiling - next.standing) * RIVAL_STANDING_DRIFT,
  );

  // A decade in the same post, still near the bottom of the tree. Not a bad month — a career that
  // stopped going anywhere, which is the reason people actually leave.
  if (next.monthsInPost >= RIVAL_STALL_MONTHS && next.level <= RIVAL_STALL_LEVEL) {
    const roll = nextChance(rngState, RIVAL_RESIGN_CHANCE);
    rngState = roll.rngState;
    if (roll.value) {
      return {
        ...state,
        rival: { ...next, left: 'resigned' },
        // Recorded on the state rather than left for content to infer, so the scene where she
        // hands in her notice fires because she did, and not on a die of its own.
        flags: { ...state.flags, [RIVAL_GONE_FLAG]: true },
        rngState,
      };
    }
  }

  // One move a cycle at most, the same rule the player's own offers follow: being handed four
  // posts in a month would read as a lottery rather than as a career.
  const fromPost = getPost(registry, next.postId);
  for (const target of postsFrom(registry, next.postId)) {
    // Two people cannot hold the same desk, and the player is sitting at one of them.
    if (target.id === state.player.postId) continue;
    if (!qualifies(next, target, fromPost)) continue;

    const roll = nextChance(rngState, RIVAL_OFFER_CHANCE);
    rngState = roll.rngState;
    if (!roll.value) continue;

    return {
      ...state,
      rival: {
        ...next,
        postId: target.id,
        level: target.tier,
        track: target.track,
        standing: clampStanding(next.standing + RIVAL_STANDING_ON_PROMOTION),
        monthsInPost: 0,
      },
      rngState,
    };
  }

  return { ...state, rival: next, rngState };
}

/**
 * A post you were offered and did not take gets filled by somebody.
 *
 * **The post being filled is the consequence; Elena is the story when it fits.** That separation
 * is the correction that made this feature work at all. The first version only closed a post if
 * Elena herself could take it, which made the cost of declining depend on where she happened to
 * be standing that year — arbitrary from the player's side, and vanishingly rare in practice: she
 * outpaces the player often enough that across three hundred and thirty-six simulated careers a
 * declined post was filled six times.
 *
 * A post in a real administration does not stay warm because you are thinking about it. So it is
 * always held for `RIVAL_HOLDS_POST_TURNS`, and `filledByRival` says whether the person who took
 * it was somebody you know.
 *
 * Held in `flags` under `post.<id>.held` — engine-owned state, the same arrangement
 * `minister_track` and `handed_over_unit` already use, and one that needed no migration.
 */
export function fillLapsedPost(
  state: GameState,
  registry: ContentRegistry,
  offer: JobOffer,
): { state: GameState; byRival: boolean } {
  const target = registry.posts.find((p) => p.id === offer.toPost);
  if (!target) return { state, byRival: false };

  const held: GameState = {
    ...state,
    flags: { ...state.flags, [heldFlag(target.id)]: state.turn + RIVAL_HOLDS_POST_TURNS },
  };

  const rival = held.rival;
  if (!rival || rival.left || !couldFill(rival, target)) return { state: held, byRival: false };

  return {
    state: {
      ...held,
      rival: {
        ...rival,
        postId: target.id,
        level: target.tier,
        track: target.track,
        standing: clampStanding(rival.standing + RIVAL_STANDING_ON_PROMOTION),
        monthsInPost: 0,
      },
    },
    byRival: true,
  };
}

/** Whether somebody else is sitting in this post right now, and it cannot be offered to you. */
export function postHeld(state: GameState, postId: string): boolean {
  const until = state.flags[heldFlag(postId)];
  return typeof until === 'number' && until > state.turn;
}

function clampStanding(value: number): number {
  return Math.max(STAT_MIN, Math.min(STAT_MAX, value));
}
