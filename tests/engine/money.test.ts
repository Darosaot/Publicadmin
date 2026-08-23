import { describe, expect, it } from 'vitest';
import {
  COMFORT_SAVINGS,
  HARDSHIP_SAVINGS,
  HARDSHIP_STRESS_PER_CYCLE,
  OUTGOINGS_OF_BASE_SALARY,
  STARTING_SAVINGS,
} from '../../src/engine/constants';
import { applyEffects, checkCondition } from '../../src/engine/effects';
import {
  comfortable,
  inHardship,
  moneyStressDelta,
  outgoingsFor,
  savingsBand,
  savingsDelta,
} from '../../src/engine/money';
import { createGame } from '../../src/engine/newGame';
import { getPost } from '../../src/engine/registry';
import { beginNextTurn, emptyAllocation, resolveTurn } from '../../src/engine/turn';
import type { GameState } from '../../src/engine/types';
import { makeQuietRegistry } from './fixtures';

const registry = makeQuietRegistry();

function game(overrides: Partial<GameState> = {}): GameState {
  const base = createGame({ name: 'Test', department: 'finance', seed: 11 }, registry);
  return { ...base, ...overrides };
}

function withSavings(savings: number): GameState {
  const base = game();
  return { ...base, player: { ...base.player, savings } };
}

describe('what a month costs to live', () => {
  it('scales with the post', () => {
    const junior = getPost(registry, 'post.test.junior');
    const head = getPost(registry, 'post.test.head');

    expect(outgoingsFor(junior)).toBe(Math.round(junior.baseSalary * OUTGOINGS_OF_BASE_SALARY));
    expect(outgoingsFor(head)).toBeGreaterThan(outgoingsFor(junior));
  });

  /**
   * Held to a fraction rather than a fixed figure because the career moves you somewhere bigger
   * every time it promotes you. The first draft used a flat cost and turned seniority into a
   * money printer: a director finished with more saved than they had earned in twenty years.
   */
  it('leaves roughly the same slice of any salary over', () => {
    const junior = outgoingsFor(getPost(registry, 'post.test.junior'));
    const head = outgoingsFor(getPost(registry, 'post.test.head'));
    const juniorSlice = 1 - junior / getPost(registry, 'post.test.junior').baseSalary;
    const headSlice = 1 - head / getPost(registry, 'post.test.head').baseSalary;

    expect(Math.abs(juniorSlice - headSlice)).toBeLessThan(0.01);
  });

  it('accrues what the months just worked left over', () => {
    const state = game();
    expect(savingsDelta(state, 1)).toBe(state.player.salary - state.player.outgoings);
    expect(savingsDelta(state, 6)).toBe((state.player.salary - state.player.outgoings) * 6);
  });

  it('lands on the state as the calendar moves', () => {
    const played = resolveTurn(game(), registry, emptyAllocation());
    const next = beginNextTurn({ ...played, phase: 'report' }, registry);

    expect(next.player.savings).toBeGreaterThan(STARTING_SAVINGS);
  });
});

describe('being short', () => {
  it('is a state, not a floor', () => {
    // Unclamped below zero deliberately: hardship is the half of this the corpus was waiting for.
    const broke = applyEffects(withSavings(500), [{ kind: 'savings', delta: -2000 }], registry);
    expect(broke.player.savings).toBe(-1500);
    expect(inHardship(broke)).toBe(true);
  });

  it('costs you every cycle until you are not', () => {
    expect(moneyStressDelta(withSavings(HARDSHIP_SAVINGS - 1))).toBe(HARDSHIP_STRESS_PER_CYCLE);
    expect(moneyStressDelta(withSavings(HARDSHIP_SAVINGS))).toBe(0);
  });

  it('shows up in the stress a cycle actually charges', () => {
    const easy = resolveTurn(withSavings(5000), registry, emptyAllocation());
    const short = resolveTurn(withSavings(-5000), registry, emptyAllocation());

    expect(short.stats.stress).toBeGreaterThan(easy.stats.stress);
  });
});

describe('being comfortable', () => {
  it('is recognised', () => {
    expect(comfortable(withSavings(COMFORT_SAVINGS))).toBe(true);
    expect(comfortable(withSavings(COMFORT_SAVINGS - 1))).toBe(false);
  });

  /**
   * And pays nothing on the stats bar, which is the correction the sweep forced.
   *
   * A competent career clears the threshold by its second post and holds it for twenty-five
   * years, so a point of relief was a flat upgrade with no downside — and it laundered itself
   * into promotion velocity through the shared stress sink in §8j, coming out five points of
   * reputation ahead. Comfort decides which choices content opens. It does not make you better at
   * the job.
   */
  it('does not make the job easier', () => {
    expect(moneyStressDelta(withSavings(COMFORT_SAVINGS * 10))).toBe(0);
  });

  it('describes the position rather than scoring it', () => {
    expect(savingsBand(withSavings(-100))).toBe('short');
    expect(savingsBand(withSavings(COMFORT_SAVINGS + 1))).toBe('comfortable');
  });
});

describe('what content can ask about money', () => {
  it('gates on having enough', () => {
    expect(checkCondition(withSavings(100), { minSavings: 5000 })?.reason).toBe('savings');
    expect(checkCondition(withSavings(9000), { minSavings: 5000 })).toBeUndefined();
  });

  /** The one these events exist for: a choice only a player who is short can see. */
  it('gates on being short', () => {
    expect(checkCondition(withSavings(90_000), { maxSavings: 0 })?.reason).toBe('savings');
    expect(checkCondition(withSavings(-200), { maxSavings: 0 })).toBeUndefined();
  });

  it('says which way it failed, so the screen can explain it', () => {
    expect(checkCondition(withSavings(0), { minSavings: 10 })?.comparison).toBe('min');
    expect(checkCondition(withSavings(100), { maxSavings: 10 })?.comparison).toBe('max');
  });
});
