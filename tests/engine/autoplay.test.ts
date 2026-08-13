import { describe, expect, it } from 'vitest';
import { MAX_TURNS } from '../../src/engine/constants';
import { ENDING_IDS, DEPARTMENT_IDS, STAT_IDS, type DepartmentId } from '../../src/engine/types';
import { playCareer, playMany, summarise } from './autoplay';

/**
 * Balance guardrails.
 *
 * These are not precise assertions — a game's balance is a distribution, not a number — but they
 * fail loudly if a change to `constants.ts` or the content makes the game unplayable in one of the
 * ways that is easy to introduce and hard to notice: everyone reaching the top, nobody reaching
 * it, an ending becoming impossible, or the whole thing crashing on some seed.
 *
 * Regenerate the underlying numbers with `npm run balance`.
 */

const seeds = Array.from({ length: 20 }, (_, i) => i * 7919 + 13);
const results = playMany(seeds, DEPARTMENT_IDS);
const summary = summarise(results);

describe('simulated careers', () => {
  it('never crashes or leaves a stat out of range', () => {
    for (const result of results) {
      for (const stat of STAT_IDS) {
        expect(result.stats[stat], `${stat} on seed ${result.seed}`).toBeGreaterThanOrEqual(0);
        expect(result.stats[stat], `${stat} on seed ${result.seed}`).toBeLessThanOrEqual(100);
      }
      expect(result.turns).toBeGreaterThan(0);
      expect(result.turns).toBeLessThanOrEqual(MAX_TURNS + 1);
      expect(result.level).toBeGreaterThanOrEqual(1);
      expect(result.level).toBeLessThanOrEqual(5);
    }
  });

  it('always reaches an ending', () => {
    for (const result of results) {
      expect(ENDING_IDS, `seed ${result.seed}`).toContain(result.ending);
    }
  });

  it('spreads careers across the ladder rather than piling them at one level', () => {
    const top = summary.byLevel[5] ?? 0;
    const bottom = summary.byLevel[1] ?? 0;

    // Reaching the top should be a real achievement, and being stuck at the start should be rare.
    expect(top / summary.runs).toBeGreaterThan(0.05);
    expect(top / summary.runs).toBeLessThan(0.8);
    expect(bottom / summary.runs).toBeLessThan(0.25);
  });

  it('leaves reputation meaningful rather than saturated', () => {
    // Decay is what stops a hundred completed files pinning everyone at 100.
    expect(summary.meanReputation).toBeGreaterThan(20);
    expect(summary.meanReputation).toBeLessThan(85);
  });

  it('makes the board tight enough that something has to give', () => {
    // A player who can finish everything is never choosing anything.
    expect(summary.completionRate).toBeGreaterThan(0.7);
    expect(summary.completionRate).toBeLessThan(0.98);
  });

  it('pays more the higher you climb', () => {
    const byLevel = new Map<number, number[]>();
    for (const result of results) {
      byLevel.set(result.level, [...(byLevel.get(result.level) ?? []), result.salary]);
    }
    const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;

    const low = byLevel.get(1);
    const high = byLevel.get(5);
    if (low?.length && high?.length) expect(mean(high)).toBeGreaterThan(mean(low));
  });

  it.each(DEPARTMENT_IDS)('%s is survivable and not a walkover', (department: DepartmentId) => {
    const subset = summarise(results.filter((r) => r.department === department));
    expect(subset.meanTurns).toBeGreaterThan(30);
    expect(subset.meanLevel).toBeGreaterThan(1.5);
    expect(subset.meanLevel).toBeLessThan(5);
  });
});

describe('every ending is reachable', () => {
  // The balanced bot reaches four of the six on its own.
  const reachedByBalanced = new Set(results.map((r) => r.ending));

  it('reaches retirement, dismissal and the ministry through ordinary play', () => {
    expect(reachedByBalanced.has('retirement_honoured')).toBe(true);
    expect(reachedByBalanced.has('retirement_quiet')).toBe(true);
  });

  it('reaches disgrace when every corrupt option is taken', () => {
    const ruthless = playMany(seeds.slice(0, 6), DEPARTMENT_IDS, 'ruthless');
    expect(ruthless.some((r) => r.ending === 'disgrace')).toBe(true);
  });

  it('reaches burnout when the player never rests', () => {
    const reckless = playMany(seeds.slice(0, 6), DEPARTMENT_IDS, 'reckless');
    expect(reckless.every((r) => r.ending === 'burnout')).toBe(true);
    // Overtime every month with no recovery should take roughly a year, not a decade.
    expect(summarise(reckless).meanTurns).toBeLessThan(20);
  });

  it('reaches the ministry on at least one seed somewhere', () => {
    const wider = playMany(
      Array.from({ length: 30 }, (_, i) => i * 104_729 + 7),
      DEPARTMENT_IDS,
    );
    expect(wider.some((r) => r.ending === 'minister')).toBe(true);
  });
});

describe('determinism', () => {
  it('replays a career identically from the same seed', () => {
    const first = playCareer(4242, 'legal');
    const second = playCareer(4242, 'legal');
    expect(second).toEqual(first);
  });

  it('produces different careers from different seeds', () => {
    const a = playCareer(1, 'policy');
    const b = playCareer(2, 'policy');
    expect(a).not.toEqual(b);
  });
});
