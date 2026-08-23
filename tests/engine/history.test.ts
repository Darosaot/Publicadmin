import { describe, expect, it } from 'vitest';
import { MAX_TURNS, RECORD_MIN_CYCLES } from '../../src/engine/constants';
import { range, record, sample, spells } from '../../src/engine/history';
import { createGame } from '../../src/engine/newGame';
import {
  acceptOffer,
  beginNextTurn,
  emptyAllocation,
  finalizeTurn,
  resolveTurn,
} from '../../src/engine/turn';
import type { GameState, JobOffer, TurnSample } from '../../src/engine/types';
// The shipped content, under its own name: `playCareer` plays real careers against it,
// while the `registry` below is the quiet fixture the rest of this file drives directly.
import { registry as shippedRegistry } from '../../src/content';
import { makeQuietRegistry } from './fixtures';
import { playCareer } from './autoplay';

const registry = makeQuietRegistry();

function game(overrides: Partial<GameState> = {}): GameState {
  const base = createGame({ name: 'Test', department: 'finance', seed: 9 }, registry);
  return { ...base, ...overrides };
}

function row(turn: number, postId = 'post.test.junior', month = turn): TurnSample {
  return {
    turn,
    calendarMonth: month,
    postId,
    level: 1,
    reputation: turn,
    performance: 50,
    politicalCapital: 10,
    integrity: 70,
    stress: 20,
    salary: 2100,
    savings: 0,
  };
}

describe('taking the reading', () => {
  it('captures where the career is, not what it is made of', () => {
    const state = game();
    const taken = sample(state);

    expect(taken.turn).toBe(state.turn);
    expect(taken.postId).toBe(state.player.postId);
    expect(taken.reputation).toBe(state.stats.reputation);
    expect(taken.savings).toBe(state.player.savings);
  });

  it('appends one row per cycle', () => {
    let state = game();
    state = record(state);
    state = record({ ...state, turn: 2 });
    state = record({ ...state, turn: 3 });

    expect(state.history.map((r) => r.turn)).toEqual([1, 2, 3]);
  });

  /**
   * `finalizeTurn` can be reached more than once in a cycle — an event queue that empties, then a
   * milestone that resolves — and a history holding the same turn twice would put a spike in every
   * chart at exactly the moments the game was most interesting.
   */
  it('replaces rather than duplicates a row for the same cycle', () => {
    let state = record(game());
    state = record({ ...state, stats: { ...state.stats, reputation: 99 } });

    expect(state.history).toHaveLength(1);
    expect(state.history[0]?.reputation).toBe(99);
  });
});

describe('the turn loop keeps it', () => {
  it('records a cycle as it closes', () => {
    const played = finalizeTurn(resolveTurn(game(), registry, emptyAllocation()), registry);
    expect(played.history).toHaveLength(1);
    expect(played.history[0]?.turn).toBe(1);
  });

  it('grows one row per cycle played', () => {
    let state = game();
    for (let i = 0; i < 5; i += 1) {
      state = finalizeTurn(resolveTurn(state, registry, emptyAllocation()), registry);
      state = beginNextTurn(state, registry);
    }
    expect(state.history).toHaveLength(5);
    expect(state.history.map((r) => r.turn)).toEqual([1, 2, 3, 4, 5]);
  });

  /** The final year is the one the epilogue most wants, so it cannot be the one that is missed. */
  it('records the cycle a career ends on', () => {
    const doomed = game({ stats: { ...game().stats, stress: 99 } });
    const ended = finalizeTurn(resolveTurn(doomed, registry, emptyAllocation()), registry);

    expect(ended.ending).toBeDefined();
    expect(ended.history.at(-1)?.turn).toBe(ended.turn);
  });

  it('never outgrows the campaign', () => {
    const run = playCareer({ seed: 4, department: 'legal' });
    expect(run.finalState.history.length).toBeLessThanOrEqual(MAX_TURNS);
    expect(run.finalState.history.length).toBeGreaterThan(RECORD_MIN_CYCLES);
  });

  it('runs in order, with no gaps, across a whole career', () => {
    const history = playCareer({ seed: 11, department: 'projects' }).finalState.history;
    for (let i = 1; i < history.length; i += 1) {
      expect(history[i]!.turn).toBe(history[i - 1]!.turn + 1);
      expect(history[i]!.calendarMonth).toBeGreaterThanOrEqual(history[i - 1]!.calendarMonth);
    }
  });
});

describe('the career as posts rather than cycles', () => {
  it('collapses a run of cycles in one post into a single spell', () => {
    const held = spells([row(1), row(2), row(3)]);

    expect(held).toHaveLength(1);
    expect(held[0]).toMatchObject({ postId: 'post.test.junior', fromTurn: 1, toTurn: 3 });
  });

  it('opens a new spell where the post changes', () => {
    const held = spells([row(1), row(2), row(3, 'post.test.senior'), row(4, 'post.test.senior')]);

    expect(held.map((s) => s.postId)).toEqual(['post.test.junior', 'post.test.senior']);
    expect(held[1]).toMatchObject({ fromTurn: 3, toTurn: 4 });
  });

  /**
   * Derived rather than recorded, which is the whole reason `postId` is in the row: a timeline
   * maintained separately would be a second source of truth about the same fact, and this
   * codebase has three documented cases of exactly that drifting.
   */
  it('matches what a real career actually did', () => {
    const state = playCareer({ seed: 7, department: 'finance', stopAtLevel: 3 }).finalState;
    const held = spells(state.history);

    // More than one post, in order, and every one of them real.
    expect(held.length).toBeGreaterThan(1);
    for (const spell of held) {
      expect(shippedRegistry.posts.some((p) => p.id === spell.postId)).toBe(true);
      expect(spell.toTurn).toBeGreaterThanOrEqual(spell.fromTurn);
    }
    for (let i = 1; i < held.length; i += 1) {
      expect(held[i]!.fromTurn).toBeGreaterThan(held[i - 1]!.toTurn);
    }

    // The last spell is the post held at the last *recorded* cycle, which is not always the post
    // the player is sitting in now: accepting an offer changes the desk immediately, and the
    // cycle that closes on the new one has not happened yet.
    expect(held.at(-1)?.postId).toBe(state.history.at(-1)?.postId);
  });

  it('is empty for a career with no record', () => {
    expect(spells([])).toEqual([]);
  });
});

describe('scaling a chart', () => {
  it('reports the high and low of a series', () => {
    expect(range([row(1), row(5), row(3)], (r) => r.reputation)).toEqual({ min: 1, max: 5 });
  });

  it('is harmless on an empty history', () => {
    expect(range([], (r) => r.reputation)).toEqual({ min: 0, max: 0 });
  });
});

describe('a save that predates the record', () => {
  /**
   * It gets an empty array and not a synthesised arc. A chart is a claim about what happened, and
   * drawing one from a single endpoint would be a fabrication rendered convincingly — worse than
   * a gap, because a gap is visible and the screen says so.
   */
  it('starts recording from where it resumes', () => {
    const midCareer = game({ turn: 40, calendarMonth: 62, history: [] });
    const after = finalizeTurn(resolveTurn(midCareer, registry, emptyAllocation()), registry);

    expect(after.history).toHaveLength(1);
    expect(after.history[0]?.turn).toBe(40);
  });
});

describe('changing post', () => {
  it('shows up as a new spell rather than as a break in the series', () => {
    let state = game({
      stats: { reputation: 90, performance: 90, politicalCapital: 60, integrity: 70, stress: 10 },
    });
    for (let i = 0; i < 3; i += 1) {
      state = finalizeTurn(resolveTurn(state, registry, emptyAllocation()), registry);
      state = beginNextTurn(state, registry);
    }

    const offer: JobOffer = {
      id: 'o',
      toPost: 'post.test.senior',
      toTier: 2,
      salary: 2900,
      createdTurn: state.turn,
      expiresTurn: state.turn + 3,
    };
    state = acceptOffer({ ...state, offers: [offer] }, registry, 'o');
    state = finalizeTurn(resolveTurn(state, registry, emptyAllocation()), registry);

    const held = spells(state.history);
    expect(held.map((s) => s.postId)).toContain('post.test.senior');

    // And the series itself stays continuous — a post change is context, not a gap in the data.
    const start = state.history[0]?.turn ?? 1;
    expect(state.history.map((r) => r.turn)).toEqual(state.history.map((_, i) => start + i));
  });
});
