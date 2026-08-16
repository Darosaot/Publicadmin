import { describe, expect, it } from 'vitest';
import { MAX_TURNS } from '../../src/engine/constants';
import {
  ENDING_IDS,
  DEPARTMENT_IDS,
  STAT_IDS,
  TRACK_IDS,
  type DepartmentId,
  type TrackId,
} from '../../src/engine/types';
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

  it('covers something like a working life, which is what the writing claims', () => {
    // The endings are titled "Thirty years" and the Minister arc says "twenty-two years ago you
    // were three days into a job in Alderford". For a long time none of that was true: a turn was
    // a month, so 120 turns was a decade. A cycle now covers more calendar time the more senior
    // the post, which costs the player no extra clicks and makes the prose honest.
    const years = summary.meanYears;
    expect(years, 'a career should be a career, not a decade').toBeGreaterThan(24);
    expect(years, 'and not so long that the arithmetic stops being plausible').toBeLessThan(36);
  });

  it('leaves reputation meaningful rather than saturated', () => {
    // Decay is what stops a hundred completed files pinning everyone at 100.
    expect(summary.meanReputation).toBeGreaterThan(20);
    expect(summary.meanReputation).toBeLessThan(85);
  });

  it('makes the month tight enough that something has to give', () => {
    // A player who can finish everything is never choosing anything.
    //
    // This used to measure the board alone, and it sat exactly on its own bound the moment
    // promotion-from-within landed and the bot started running a better unit. That is not the
    // guardrail failing — it is the guardrail having been written when the board was the only
    // place pressure could show. There are two channels now, so it asks the real question:
    // across a whole career, is there anything the player did not get to?
    expect(summary.completionRate).toBeGreaterThan(0.7);
    expect(summary.completionRate).toBeLessThan(0.995);

    const gaveSomethingUp = results.filter(
      (r) => r.tasksFailed > 0 || r.initiativesLapsed > 0,
    ).length;
    expect(gaveSomethingUp / results.length).toBeGreaterThan(0.9);
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

  it('does not punish the player for the department they chose', () => {
    // The five departments drifted a long way apart once each had its own task board and event
    // pool: at one point a procurement career averaged two levels below a policy one, for no
    // reason the player could see or act on. Adding content to one department without checking
    // the others is exactly how that happens again, so it is pinned here.
    //
    // The sample is small, so the band is generous; `npm run balance` reports the real spread.
    const levels = DEPARTMENT_IDS.map((department) => ({
      department,
      level: summarise(results.filter((r) => r.department === department)).meanLevel,
    }));
    const best = levels.reduce((a, b) => (a.level >= b.level ? a : b));
    const worst = levels.reduce((a, b) => (a.level <= b.level ? a : b));

    expect(
      best.level - worst.level,
      `${best.department} outruns ${worst.department} by too much`,
    ).toBeLessThan(1.2);
  });
});

/**
 * Initiatives, measured against the same careers played without them.
 *
 * A/B on identical seeds rather than absolute bands, because this commit changes several things at
 * once and an absolute number could not tell them apart. The A side is literally the game as it
 * was before initiatives existed.
 */
describe('the initiatives the player chooses', () => {
  const withInitiatives = summarise(playMany(seeds.slice(0, 10), DEPARTMENT_IDS));
  const without = summarise(
    playMany(seeds.slice(0, 10), DEPARTMENT_IDS, { useInitiatives: false }),
  );

  it('gets used at all, which is the thing a guardrail most easily fails to check', () => {
    // The documented failure mode of this whole harness: a bound that measures nothing reads as
    // green. If the bot never starts one, every other assertion below is vacuous.
    expect(withInitiatives.meanInitiativesStarted).toBeGreaterThan(1);
    expect(withInitiatives.meanInitiativesCompleted).toBeGreaterThan(1);
    expect(without.meanInitiativesStarted).toBe(0);
  });

  it('can also be dropped — commitment that cannot fail is not commitment', () => {
    expect(withInitiatives.totalInitiativesLapsed).toBeGreaterThan(0);
  });

  /**
   * The direction that matters. Offers key off reputation, so an initiative paying a lump of it
   * would convert hoarded effort into promotion velocity and become the dominant strategy. These
   * pay in the country instead, so the career effect should be small — and slightly negative,
   * because the months went somewhere other than the files.
   */
  it('does not become the way to get promoted', () => {
    expect(withInitiatives.meanLevel - without.meanLevel).toBeLessThan(0.4);
  });

  it('costs something, but not a career', () => {
    expect(without.meanLevel - withInitiatives.meanLevel).toBeLessThan(0.6);
    expect(without.meanYears - withInitiatives.meanYears).toBeLessThan(3);
  });

  it('is startable by every kind of career, not only the one the bot happens to play', () => {
    for (const track of TRACK_IDS) {
      const runs = playMany(seeds.slice(0, 4), DEPARTMENT_IDS, { preferredTrack: track });
      expect(
        runs.some((r) => r.initiativesStarted > 0),
        `nobody on ${track} ever starts an initiative`,
      ).toBe(true);
    }
  });
});

describe('every track is a real career', () => {
  // Played deliberately, one branch at a time. A branch nobody can climb is dead content, and a
  // branch that is strictly better than the others makes the choice meaningless.
  const byTrack = new Map<TrackId, ReturnType<typeof summarise>>(
    TRACK_IDS.map((track) => [
      track,
      summarise(playMany(seeds.slice(0, 8), DEPARTMENT_IDS, { preferredTrack: track })),
    ]),
  );

  it.each(TRACK_IDS)('%s is survivable and not a walkover', (track: TrackId) => {
    const summary = byTrack.get(track)!;
    expect(summary.meanLevel, `${track} goes nowhere`).toBeGreaterThan(2.5);
    expect(summary.meanLevel, `${track} is a walkover`).toBeLessThan(5);
    expect(summary.meanTurns).toBeGreaterThan(30);
  });

  it('does not make one branch obviously the right one', () => {
    const levels = [...byTrack.entries()].map(([track, s]) => ({ track, level: s.meanLevel }));
    const best = levels.reduce((a, b) => (a.level >= b.level ? a : b));
    const worst = levels.reduce((a, b) => (a.level <= b.level ? a : b));

    expect(
      best.level - worst.level,
      `${best.track} outruns ${worst.track} by too much`,
    ).toBeLessThan(1.2);
  });

  it('actually reaches the branches, rather than reporting the line track four times', () => {
    // The first per-track run looked healthy and was measuring nothing: only one offer exists per
    // cycle, so preferring a track among simultaneous offers never changed a decision.
    for (const track of TRACK_IDS) {
      const runs = playMany(seeds.slice(0, 8), DEPARTMENT_IDS, { preferredTrack: track });
      const ended = runs.filter((r) => r.track === track).length;
      expect(ended / runs.length, `nobody ends up on ${track}`).toBeGreaterThan(0.5);
    }
  });
});

describe('the cast', () => {
  it('gets met in ordinary play rather than only in theory', () => {
    // Introductions are gated on not having met, so a career that never runs into anybody means
    // the gates are wrong, not that the writing is unlucky.
    const met = new Set<string>();
    for (const run of results) {
      for (const flag of Object.keys(run.finalState.flags)) {
        if (flag.startsWith('met.')) met.add(flag);
      }
    }
    expect(met.size, 'nobody in the cast is ever met').toBeGreaterThan(4);
  });

  it('remembers: standing moves in both directions across a career', () => {
    const standings = results.flatMap((r) =>
      Object.entries(r.finalState.flags)
        .filter(([flag]) => flag.startsWith('rel.'))
        .map(([, value]) => (typeof value === 'number' ? value : 0)),
    );

    expect(standings.length, 'no relationship was ever scored').toBeGreaterThan(10);
    expect(standings.some((v) => v > 10), 'nobody ever warms to you').toBe(true);
    expect(standings.some((v) => v < -5), 'nobody is ever put off').toBe(true);
  });

  it('never meets the same person twice for the first time', () => {
    // The introductions are `unknown`-gated, so firing one twice would mean the gate is not
    // holding — and the player would be introduced to a twenty-year colleague in their last year.
    for (const run of results) {
      const intros = run.finalState.firedEvents.filter((id) => id.endsWith('_meet'));
      expect(new Set(intros).size).toBe(intros.length);
    }
  });
});

describe('decisions come back', () => {
  it('fires consequence events that only a past choice can unlock', () => {
    // The reckonings pool is gated entirely on flags set years earlier, so an event from it
    // firing is proof that a decision was remembered. If this drops to zero, either the flags
    // stopped being set or the gates are unreachable in practice — both silent failures.
    const reckonings = results.flatMap((r) =>
      r.finalState.firedEvents.filter((id) => id.startsWith('evt.reckon.')),
    );
    expect(new Set(reckonings).size, 'no consequence event ever fired').toBeGreaterThan(3);
  });

  it('reaches them through the corrupt path too, where most of the flags are set', () => {
    const ruthless = playMany(seeds.slice(0, 6), DEPARTMENT_IDS, { strategy: 'ruthless' });
    const anyFlags = ruthless.some((r) =>
      Object.keys(r.finalState.flags).some((f) => f !== 'minister_track'),
    );
    expect(anyFlags, 'a ruthless career should leave a trail').toBe(true);
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
    const ruthless = playMany(seeds.slice(0, 6), DEPARTMENT_IDS, { strategy: 'ruthless' });
    expect(ruthless.some((r) => r.ending === 'disgrace')).toBe(true);
  });

  it('reaches burnout when the player never rests', () => {
    const reckless = playMany(seeds.slice(0, 6), DEPARTMENT_IDS, { strategy: 'reckless' });
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
    const first = playCareer({ seed: 4242, department: 'legal' });
    const second = playCareer({ seed: 4242, department: 'legal' });
    expect(second).toEqual(first);
  });

  it('produces different careers from different seeds', () => {
    const a = playCareer({ seed: 1, department: 'policy' });
    const b = playCareer({ seed: 2, department: 'policy' });
    expect(a).not.toEqual(b);
  });
});
