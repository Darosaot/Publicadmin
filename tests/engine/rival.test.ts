import { describe, expect, it } from 'vitest';
import {
  RIVAL_HOLDS_POST_TURNS,
  RIVAL_MIN_MONTHS_TO_MOVE,
  RIVAL_STALL_LEVEL,
  RIVAL_STALL_MONTHS,
  RIVAL_STARTING_STANDING,
  RIVAL_GONE_FLAG,
} from '../../src/engine/constants';
import { declineOffer, expireOffers } from '../../src/engine/career';
import { checkCondition } from '../../src/engine/effects';
import { createGame } from '../../src/engine/newGame';
import {
  advanceRival,
  createRival,
  fillLapsedPost,
  heldFlag,
  postHeld,
  rivalGap,
  rivalPost,
  displaceRival,
} from '../../src/engine/rival';
import type { GameState, JobOffer, RivalState } from '../../src/engine/types';
import { makeQuietRegistry } from './fixtures';

const registry = makeQuietRegistry();

const JUNIOR = 'post.test.junior';
const SENIOR = 'post.test.senior';
const HEAD = 'post.test.head';

function game(overrides: Partial<GameState> = {}): GameState {
  const base = createGame({ name: 'Test', department: 'finance', seed: 5 }, registry);
  return { ...base, ...overrides };
}

/** A rival placed exactly where a test needs her, rather than wherever the seed put her. */
function withRival(state: GameState, rival: Partial<RivalState>): GameState {
  return {
    ...state,
    rival: {
      postId: JUNIOR,
      level: 1,
      track: 'line',
      standing: RIVAL_STARTING_STANDING,
      ceiling: 70,
      monthsInPost: 24,
      ...rival,
    },
  };
}

function offerTo(postId: string, turn = 1): JobOffer {
  return {
    id: `o-${postId}`,
    toPost: postId,
    toTier: 2,
    salary: 2900,
    createdTurn: turn,
    expiresTurn: turn,
  };
}

describe('a career of her own', () => {
  it('starts her where every career starts', () => {
    const { rival } = createRival(1, registry);
    expect(rival.postId).toBe(JUNIOR);
    expect(rival.level).toBe(1);
    expect(rival.standing).toBe(RIVAL_STARTING_STANDING);
  });

  it('rolls a different Elena on a different seed', () => {
    const ceilings = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((s) => createRival(s, registry).rival.ceiling));
    // A single ceiling across eight seeds would mean every career gets the same control group,
    // which is most of the reason for having one.
    expect(ceilings.size).toBeGreaterThan(1);
  });

  it('walks her standing toward how good she actually is, and no further', () => {
    let state = withRival(game(), { standing: 20, ceiling: 60 });
    for (let i = 0; i < 200; i += 1) state = advanceRival(state, registry);

    expect(state.rival!.standing).toBeGreaterThan(55);
    expect(state.rival!.standing).toBeLessThanOrEqual(61);
  });

  it('does not promote her past the terms written on the edge', () => {
    // Well short of the tier-2 bar of 35, and given three hundred cycles to prove it.
    let state = withRival(game(), { standing: 20, ceiling: 24 });
    for (let i = 0; i < 300; i += 1) state = advanceRival(state, registry);

    expect(state.rival!.postId).toBe(JUNIOR);
  });

  it('promotes her when she clears it', () => {
    let state = withRival(game(), { standing: 80, ceiling: 80, monthsInPost: 40 });
    for (let i = 0; i < 200; i += 1) state = advanceRival(state, registry);

    expect(state.rival!.level).toBeGreaterThan(1);
  });

  it('never puts her at the desk the player is sitting at', () => {
    let state = withRival({ ...game(), player: { ...game().player, postId: SENIOR, level: 2 } }, {
      standing: 95,
      ceiling: 95,
      monthsInPost: 60,
    });
    for (let i = 0; i < 100; i += 1) state = advanceRival(state, registry);

    expect(state.rival!.postId).not.toBe(SENIOR);
  });

  it('leaves her alone once she has gone', () => {
    const gone = withRival(game(), { left: 'resigned', standing: 10 });
    expect(advanceRival(gone, registry).rival).toEqual(gone.rival);
  });

  /**
   * She leaves because the career stopped going anywhere, not because a number dipped.
   *
   * The second draft of this asked whether her standing had fallen below a threshold, which was
   * unreachable: standing climbs toward a ceiling of at least 48 and only a promotion knocks it
   * down, so nothing could ever be below the bar. Zero rivals resigned across eighty-four
   * careers. This is the assertion that catches that.
   */
  it('gives up after a decade stuck near the bottom', () => {
    let state = withRival(game(), { level: RIVAL_STALL_LEVEL, postId: SENIOR, monthsInPost: RIVAL_STALL_MONTHS });
    for (let i = 0; i < 300 && !state.rival!.left; i += 1) state = advanceRival(state, registry);

    expect(state.rival!.left).toBe('resigned');
    expect(state.flags[RIVAL_GONE_FLAG]).toBe(true);
  });

  it('does not give up on a career that is still moving', () => {
    let state = withRival(game(), { monthsInPost: 0, standing: 80, ceiling: 90 });
    for (let i = 0; i < 60; i += 1) state = advanceRival(state, registry);
    expect(state.rival!.left).toBeUndefined();
  });

  it('does not give up at the top of the tree, however long she sits there', () => {
    let state = withRival(game(), { level: 3, postId: HEAD, monthsInPost: RIVAL_STALL_MONTHS * 4 });
    for (let i = 0; i < 200; i += 1) state = advanceRival(state, registry);
    expect(state.rival!.left).toBeUndefined();
  });
});

describe('the gap, which is what the content is about', () => {
  it('is positive when she is ahead and negative when she is behind', () => {
    expect(rivalGap(withRival(game(), { level: 3 }))).toBe(2);
    expect(rivalGap(withRival(game(), { level: 1 }))).toBe(0);
    expect(
      rivalGap(withRival({ ...game(), player: { ...game().player, level: 4 } }, { level: 1 })),
    ).toBe(-3);
  });

  /** A career that ended is not a career you are behind. */
  it('reads level once she has left', () => {
    expect(rivalGap(withRival(game(), { level: 5, left: 'retired' }))).toBe(0);
  });

  it('does not let a gap gate fire once she has gone', () => {
    const gone = withRival(game(), { level: 1, left: 'resigned' });
    expect(checkCondition(gone, { minRivalGap: 0, maxRivalGap: 0 })?.reason).toBe('rival');
    expect(checkCondition({ ...game(), rival: undefined }, { maxRivalGap: 0 })?.reason).toBe('rival');
  });

  it('reads level for a save that predates her', () => {
    expect(rivalGap({ ...game(), rival: undefined })).toBe(0);
    expect(rivalPost({ ...game(), rival: undefined }, registry)).toBeUndefined();
  });
});

describe('a post you did not take', () => {
  /**
   * The correction that made the feature work at all. The first version closed a post only if
   * Elena herself could take it, so the cost of declining depended on where she happened to be
   * standing — and across 336 simulated careers it fired six times.
   */
  it('is filled whether or not she was the one who could take it', () => {
    const farAhead = withRival(game(), { postId: HEAD, level: 3, standing: 90 });
    const { state, byRival } = fillLapsedPost(farAhead, registry, offerTo(SENIOR));

    expect(byRival).toBe(false);
    expect(postHeld(state, SENIOR)).toBe(true);
  });

  it('goes to her when she was a plausible appointment', () => {
    const behind = withRival(game(), { standing: 90, monthsInPost: 40 });
    const { state, byRival } = fillLapsedPost(behind, registry, offerTo(SENIOR));

    expect(byRival).toBe(true);
    expect(state.rival!.postId).toBe(SENIOR);
    expect(state.rival!.monthsInPost).toBe(0);
  });

  it('does not go to somebody who could not have got it', () => {
    const shortOfIt = withRival(game(), { standing: 5, monthsInPost: 40 });
    expect(fillLapsedPost(shortOfIt, registry, offerTo(SENIOR)).byRival).toBe(false);
  });

  it('does not go to somebody who has only just arrived somewhere', () => {
    const justMoved = withRival(game(), { standing: 90, monthsInPost: RIVAL_MIN_MONTHS_TO_MOVE - 1 });
    expect(fillLapsedPost(justMoved, registry, offerTo(SENIOR)).byRival).toBe(false);
  });

  it('is closed to you while somebody is sitting in it, and opens again after', () => {
    const state = fillLapsedPost(withRival(game(), {}), registry, offerTo(SENIOR)).state;

    expect(postHeld(state, SENIOR)).toBe(true);
    expect(postHeld({ ...state, turn: state.turn + RIVAL_HOLDS_POST_TURNS + 1 }, SENIOR)).toBe(false);
  });

  it('costs the same whether you decline it or let it run out', () => {
    const base = withRival(game(), { standing: 90, monthsInPost: 40 });
    const offer = offerTo(SENIOR);

    const declined = declineOffer({ ...base, offers: [offer] }, registry, offer.id);
    const lapsed = expireOffers({ ...base, offers: [offer], turn: offer.expiresTurn + 1 }, registry);

    expect(declined.flags[heldFlag(SENIOR)]).toBeDefined();
    expect(lapsed.flags[heldFlag(SENIOR)]).toBeDefined();
    expect(declined.offers).toHaveLength(0);
    expect(lapsed.offers).toHaveLength(0);
  });

  it('says so in the log, and names her when it was her', () => {
    const base = withRival(game(), { standing: 90, monthsInPost: 40 });
    const offer = offerTo(SENIOR);
    const after = declineOffer({ ...base, offers: [offer] }, registry, offer.id);

    expect(after.log.at(-1)?.messageKey).toBe('log.rival_took_post');
  });

  it('leaves a career with no rival alone but still fills the post', () => {
    const none: GameState = { ...game(), rival: undefined };
    const { state, byRival } = fillLapsedPost(none, registry, offerTo(SENIOR));

    expect(byRival).toBe(false);
    expect(postHeld(state, SENIOR)).toBe(true);
  });
});

describe('taking the post she was sitting in', () => {
  /**
   * The career screen showed two people holding one job — the player's own post title, under
   * somebody else's name, in the panel describing her. `advanceRival` already refused to move
   * her onto the player's desk; nothing stopped the player moving onto hers.
   */
  it('moves her on when there is somewhere for her to go', () => {
    const state = withRival(
      { ...game(), player: { ...game().player, postId: SENIOR, level: 2 } },
      { postId: SENIOR, level: 2, standing: 90, monthsInPost: 60 },
    );
    const after = displaceRival(state, registry, SENIOR);

    expect(after.rival!.postId).not.toBe(SENIOR);
    expect(after.rival!.left).toBeUndefined();
  });

  /**
   * Leaving is the last resort, not the first. The first version resigned her whenever she could
   * not be promoted out of the way, which ended a fourth-tier career because one desk was filled
   * and read as the game punishing her for the player's promotion.
   */
  it('moves her sideways rather than out when she cannot be promoted', () => {
    const state = withRival(
      { ...game(), player: { ...game().player, postId: SENIOR, level: 2 } },
      { postId: SENIOR, level: 2, standing: 5, monthsInPost: 60 },
    );
    const after = displaceRival(state, registry, SENIOR);

    expect(after.rival!.left).toBeUndefined();
    expect(after.rival!.postId).not.toBe(SENIOR);
  });

  it('leaves her alone when she was somewhere else', () => {
    const state = withRival(game(), { postId: JUNIOR });
    expect(displaceRival(state, registry, SENIOR).rival).toEqual(state.rival);
  });

  it('never leaves the two of them in the same post after a promotion', () => {
    const state = withRival(game(), { postId: SENIOR, level: 2, standing: 90, monthsInPost: 60 });
    const moved = { ...state, player: { ...state.player, postId: SENIOR, level: 2 } };
    const after = displaceRival(moved, registry, SENIOR);

    expect(after.rival!.left !== undefined || after.rival!.postId !== after.player.postId).toBe(true);
  });
});
