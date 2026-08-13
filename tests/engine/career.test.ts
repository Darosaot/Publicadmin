import { describe, expect, it } from 'vitest';
import {
  acceptOffer,
  checkForOffer,
  checkMinisterTrack,
  declineOffer,
  expireOffers,
  isReviewDue,
  meetsRequirements,
  offerChance,
  ratingForPerformance,
  runReview,
} from '../../src/engine/career';
import { createGame } from '../../src/engine/newGame';
import { beginNextTurn, emptyAllocation, resolveTurn } from '../../src/engine/turn';
import type { GameState, JobOffer, PlayerStats } from '../../src/engine/types';
import { makeQuietRegistry } from './fixtures';

const registry = makeQuietRegistry();

function game(overrides: Partial<GameState> = {}, stats: Partial<PlayerStats> = {}): GameState {
  const base = createGame({ name: 'Test', department: 'finance', seed: 8 }, registry);
  return { ...base, ...overrides, stats: { ...base.stats, ...stats } };
}

/** State that clears the level-2 bar with room to spare. */
function promotable(overrides: Partial<GameState> = {}): GameState {
  return game(
    { player: { ...game().player, turnsAtLevel: 10 }, ...overrides },
    { reputation: 45, performance: 60 },
  );
}

describe('reviews', () => {
  it('comes due every six months', () => {
    expect(isReviewDue(game({ turn: 5, lastReviewTurn: 0 }))).toBe(false);
    expect(isReviewDue(game({ turn: 6, lastReviewTurn: 0 }))).toBe(true);
    expect(isReviewDue(game({ turn: 11, lastReviewTurn: 6 }))).toBe(false);
    expect(isReviewDue(game({ turn: 12, lastReviewTurn: 6 }))).toBe(true);
  });

  it('rates on the documented performance bands', () => {
    expect(ratingForPerformance(80)).toBe('outstanding');
    expect(ratingForPerformance(75)).toBe('outstanding');
    expect(ratingForPerformance(74)).toBe('solid');
    expect(ratingForPerformance(55)).toBe('solid');
    expect(ratingForPerformance(54)).toBe('adequate');
    expect(ratingForPerformance(40)).toBe('adequate');
    expect(ratingForPerformance(39)).toBe('concerning');
  });

  it('raises reputation and salary for a good review', () => {
    const state = game({ turn: 6 }, { performance: 80 });
    const { state: next, report } = runReview(state);

    expect(report.rating).toBe('outstanding');
    expect(next.stats.reputation).toBe(state.stats.reputation + 6);
    expect(next.player.salary).toBeGreaterThan(state.player.salary);
    expect(report.salaryDelta).toBe(Math.round(state.player.salary * 0.03));
  });

  it('costs reputation for a bad one', () => {
    const state = game({ turn: 6 }, { performance: 20, reputation: 40 });
    const { state: next, report } = runReview(state);
    expect(report.rating).toBe('concerning');
    expect(next.stats.reputation).toBe(35);
  });

  it('drops a band when too many deadlines were missed', () => {
    const state = game({ turn: 6, sinceReview: { completed: 4, failed: 3 } }, { performance: 80 });
    expect(runReview(state).report.rating).toBe('solid');
  });

  it('resets the counters and the clock', () => {
    const state = game({ turn: 6, sinceReview: { completed: 4, failed: 1 } });
    const { state: next } = runReview(state);
    expect(next.sinceReview).toEqual({ completed: 0, failed: 0 });
    expect(next.lastReviewTurn).toBe(6);
  });
});

describe('promotion requirements', () => {
  it('checks reputation, performance, political capital and time served', () => {
    expect(meetsRequirements(promotable(), registry, 2)).toBe(true);

    const green = game({ player: { ...game().player, turnsAtLevel: 2 } }, { reputation: 45, performance: 60 });
    expect(meetsRequirements(green, registry, 2)).toBe(false);

    const unknown = game({ player: { ...game().player, turnsAtLevel: 20 } }, { reputation: 90, performance: 90 });
    expect(meetsRequirements(unknown, registry, 2)).toBe(true);
    expect(meetsRequirements(unknown, registry, 3)).toBe(false); // political capital still 10
  });

  it('has no requirements to satisfy for a level that does not exist', () => {
    expect(meetsRequirements(promotable(), registry, 9)).toBe(false);
  });

  it('improves the odds the further past the bar you are, up to a ceiling', () => {
    const bare = game({}, { reputation: 35 });
    const strong = game({}, { reputation: 60 });
    const stellar = game({}, { reputation: 100 });

    expect(offerChance(bare, registry, 2)).toBeCloseTo(0.35);
    expect(offerChance(strong, registry, 2)).toBeCloseTo(0.6);
    expect(offerChance(stellar, registry, 2)).toBeCloseTo(0.8);
  });
});

describe('offers', () => {
  it('eventually produces an offer once you qualify', () => {
    let found = false;
    for (let seed = 0; seed < 30 && !found; seed += 1) {
      const state = { ...promotable(), rngState: seed * 7919 };
      if (checkForOffer(state, registry).offer) found = true;
    }
    expect(found).toBe(true);
  });

  it('never offers a post you do not qualify for', () => {
    for (let seed = 0; seed < 30; seed += 1) {
      const state = { ...game({}, { reputation: 5 }), rngState: seed * 7919 };
      expect(checkForOffer(state, registry).offer).toBeUndefined();
    }
  });

  it('does not stack a second offer for the same level', () => {
    const existing: JobOffer = {
      id: 'offer-2-1',
      toLevel: 2,
      salary: 2900,
      createdTurn: 1,
      expiresTurn: 4,
    };
    const state = { ...promotable({ offers: [existing] }) };
    expect(checkForOffer(state, registry).offer).toBeUndefined();
  });

  it('stops offering once the ladder runs out', () => {
    const top = game({ player: { ...game().player, level: 3, turnsAtLevel: 40 } }, { reputation: 100, performance: 100, politicalCapital: 100 });
    expect(checkForOffer(top, registry).offer).toBeUndefined();
  });

  it('prices the offer near the level baseline', () => {
    let offer: JobOffer | undefined;
    for (let seed = 0; seed < 40 && !offer; seed += 1) {
      offer = checkForOffer({ ...promotable(), rngState: seed * 7919 }, registry).offer;
    }
    expect(offer).toBeDefined();
    expect(offer!.salary).toBeGreaterThan(2900 * 0.93);
    expect(offer!.salary).toBeLessThan(2900 * 1.07);
  });

  it('expires offers once their window closes', () => {
    const offer: JobOffer = { id: 'o', toLevel: 2, salary: 2900, createdTurn: 1, expiresTurn: 4 };
    expect(expireOffers(game({ turn: 4, offers: [offer] })).offers).toHaveLength(1);
    expect(expireOffers(game({ turn: 5, offers: [offer] })).offers).toHaveLength(0);
  });

  it('drops an offer that is declined', () => {
    const offer: JobOffer = { id: 'o', toLevel: 2, salary: 2900, createdTurn: 1, expiresTurn: 4 };
    expect(declineOffer(game({ offers: [offer] }), 'o').offers).toHaveLength(0);
  });
});

describe('taking the job', () => {
  it('moves the player up, pays the new salary and hands them a fresh desk', () => {
    const offer: JobOffer = { id: 'o', toLevel: 2, salary: 3050, createdTurn: 1, expiresTurn: 4 };
    const state = promotable({ offers: [offer] });
    const next = acceptOffer(state, registry, 'o');

    expect(next.player.level).toBe(2);
    expect(next.player.salary).toBe(3050);
    expect(next.player.turnsAtLevel).toBe(0);
    expect(next.offers).toHaveLength(0);
    // Level 2 has four slots, and none of the old tasks came along.
    expect(next.tasks).toHaveLength(4);
    expect(next.tasks.every((t) => !state.tasks.some((old) => old.uid === t.uid))).toBe(true);
  });

  it('scales the workload on the new desk to the bigger post', () => {
    const offer: JobOffer = { id: 'o', toLevel: 2, salary: 3050, createdTurn: 1, expiresTurn: 4 };
    const next = acceptOffer(promotable({ offers: [offer] }), registry, 'o');
    const easy = next.tasks.find((t) => t.templateId === 'task.test.easy');
    // baseEffort 4 at level 2 rounds to 4 * 1.12 = 4.48 -> 4; the hard one shows the scaling.
    const hard = next.tasks.find((t) => t.templateId === 'task.test.hard');
    expect(easy?.required ?? 4).toBeGreaterThanOrEqual(4);
    expect(hard?.required ?? 10).toBeGreaterThan(9);
  });

  it('ignores an offer that is not on the table', () => {
    const state = promotable();
    expect(acceptOffer(state, registry, 'nope')).toBe(state);
  });
});

describe('the minister track', () => {
  it('opens only at the top of the ladder with the reputation and the allies', () => {
    const topLevel = { ...game().player, level: 3 };

    const notThere = game({ player: topLevel }, { reputation: 80, politicalCapital: 80 });
    expect(checkMinisterTrack(notThere, registry).flags.minister_track).toBeUndefined();

    const noAllies = game({ player: topLevel }, { reputation: 95, politicalCapital: 40 });
    expect(checkMinisterTrack(noAllies, registry).flags.minister_track).toBeUndefined();

    const tooJunior = game({}, { reputation: 95, politicalCapital: 80 });
    expect(checkMinisterTrack(tooJunior, registry).flags.minister_track).toBeUndefined();

    const ready = game({ player: topLevel }, { reputation: 95, politicalCapital: 80 });
    expect(checkMinisterTrack(ready, registry).flags.minister_track).toBe(true);
  });
});

describe('reviews inside a real turn', () => {
  it('arrives in the turn report on the sixth month', () => {
    let state = createGame({ name: 'Test', department: 'finance', seed: 31 }, registry);

    for (let i = 0; i < 5; i += 1) {
      state = resolveTurn(state, registry, emptyAllocation());
      state = beginNextTurn(state, registry);
    }
    expect(state.turn).toBe(6);

    state = resolveTurn(state, registry, emptyAllocation());
    expect(state.lastReport?.review).toBeDefined();
  });
});
