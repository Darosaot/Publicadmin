import { describe, expect, it } from 'vitest';
import {
  nextChance,
  nextFloat,
  nextInt,
  pick,
  seedToState,
  weightedPick,
  weightedSample,
} from '../../src/engine/rng';

describe('rng', () => {
  it('produces the same sequence for the same seed', () => {
    const run = (seed: number) => {
      let state = seedToState(seed);
      const values: number[] = [];
      for (let i = 0; i < 12; i += 1) {
        const roll = nextFloat(state);
        values.push(roll.value);
        state = roll.rngState;
      }
      return values;
    };

    expect(run(42)).toEqual(run(42));
    expect(run(42)).not.toEqual(run(43));
  });

  it('separates neighbouring seeds', () => {
    // Without the hashing step, seeds 1/2/3 produce suspiciously similar first draws.
    const first = (seed: number) => nextFloat(seedToState(seed)).value;
    const values = [1, 2, 3, 4, 5].map(first);
    const spread = Math.max(...values) - Math.min(...values);
    expect(spread).toBeGreaterThan(0.2);
  });

  it('keeps floats in [0, 1)', () => {
    let state = seedToState(7);
    for (let i = 0; i < 500; i += 1) {
      const roll = nextFloat(state);
      expect(roll.value).toBeGreaterThanOrEqual(0);
      expect(roll.value).toBeLessThan(1);
      state = roll.rngState;
    }
  });

  it('keeps integers within the inclusive range and reaches both ends', () => {
    let state = seedToState(11);
    const seen = new Set<number>();
    for (let i = 0; i < 500; i += 1) {
      const roll = nextInt(state, 2, 5);
      expect(roll.value).toBeGreaterThanOrEqual(2);
      expect(roll.value).toBeLessThanOrEqual(5);
      seen.add(roll.value);
      state = roll.rngState;
    }
    expect([...seen].sort()).toEqual([2, 3, 4, 5]);
  });

  it('treats probability 0 and 1 as certainties', () => {
    let state = seedToState(3);
    for (let i = 0; i < 50; i += 1) {
      const never = nextChance(state, 0);
      const always = nextChance(state, 1);
      expect(never.value).toBe(false);
      expect(always.value).toBe(true);
      state = never.rngState;
    }
  });

  it('returns undefined when picking from an empty list', () => {
    expect(pick(seedToState(1), []).value).toBeUndefined();
    expect(weightedPick(seedToState(1), [], () => 1).value).toBeUndefined();
  });

  it('never selects zero-weight items', () => {
    const items = ['a', 'b', 'c'];
    const weightOf = (item: string) => (item === 'b' ? 0 : 5);
    let state = seedToState(9);
    for (let i = 0; i < 300; i += 1) {
      const roll = weightedPick(state, items, weightOf);
      expect(roll.value).not.toBe('b');
      state = roll.rngState;
    }
  });

  it('respects relative weights', () => {
    const items = ['heavy', 'light'];
    const weightOf = (item: string) => (item === 'heavy' ? 9 : 1);
    let state = seedToState(5);
    let heavy = 0;
    const runs = 2000;
    for (let i = 0; i < runs; i += 1) {
      const roll = weightedPick(state, items, weightOf);
      if (roll.value === 'heavy') heavy += 1;
      state = roll.rngState;
    }
    expect(heavy / runs).toBeGreaterThan(0.85);
    expect(heavy / runs).toBeLessThan(0.95);
  });

  it('samples without replacement and stops when the pool runs out', () => {
    const items = ['a', 'b', 'c'];
    const sample = weightedSample(seedToState(2), items, () => 1, 5);
    expect(sample.value).toHaveLength(3);
    expect(new Set(sample.value).size).toBe(3);
  });

  it('advances the cursor on every draw', () => {
    const start = seedToState(17);
    expect(nextFloat(start).rngState).not.toBe(start);
    expect(weightedPick(start, ['a'], () => 1).rngState).not.toBe(start);
  });
});
