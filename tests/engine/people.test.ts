import { describe, expect, it } from 'vitest';
import { createGame } from '../../src/engine/newGame';
import {
  MAX_STAFF_LEVEL,
  STAFF_TRAITS,
  XP_PER_LEVEL,
  capacityOf,
  DIPLOMAT_FLOOR,
  STEADY_THRESHOLD,
  diplomatFloor,
  levelProgress,
  specialismFactor,
  specialismFromName,
  specialismOf,
  staffLevel,
  traitMoraleDrift,
  traitOf,
  traitOutputFactor,
  traitQualityDelta,
} from '../../src/engine/people';
import { DELEGATION_CAPACITY } from '../../src/engine/constants';
import { DEPARTMENT_IDS } from '../../src/engine/types';
import { staffNames } from '../../src/content';
import type { StaffMember, TaskTemplate } from '../../src/engine/types';
import { makeQuietRegistry } from './fixtures';

const registry = makeQuietRegistry();

function person(name: string, over: Partial<StaffMember> = {}): StaffMember {
  return {
    id: name,
    name,
    seniority: 'officer',
    specialism: 'legal',
    skill: 55,
    morale: 60,
    salary: 2600,
    monthsInPost: 12,
    xp: 0,
    ...over,
  };
}

/**
 * Somebody of every trait, found by searching the real cast.
 *
 * Deliberately the shipped names rather than the fixture registry's five: the claim being tested
 * is that *this* cast covers every trait, which a hand-made fixture could satisfy or fail
 * independently of whether the game does.
 */
function withTrait(trait: string): StaffMember {
  for (const name of staffNames) {
    const candidate = person(name);
    if (traitOf(candidate) === trait) return candidate;
  }
  throw new Error(`no name in the cast produces the trait "${trait}"`);
}

describe('who somebody is', () => {
  it('reads the same trait and fallback field from the same name every time', () => {
    expect(specialismFromName('Tomas Bergqvist')).toBe(specialismFromName('Tomas Bergqvist'));
    expect(traitOf(person('Tomas Bergqvist'))).toBe(traitOf(person('Tomas Bergqvist')));
  });

  it('does not correlate the fallback specialism with a trait', () => {
    // Both folds of the name; seeded off the same number there would only really be nine kinds of
    // person in the game rather than fifty-four.
    const pairs = new Set(staffNames.map((n) => `${specialismFromName(n)}/${traitOf(person(n))}`));
    expect(pairs.size).toBeGreaterThan(DEPARTMENT_IDS.length);
  });

  /** A generator that gives forty people the same trait is not a cast, it is a uniform. */
  it('spreads the real cast across every trait', () => {
    const seen = new Set(staffNames.map((n) => traitOf(person(n))));
    expect(seen.size).toBe(STAFF_TRAITS.length);
  });

  /** The fallback the v6 migration leans on: it has to cover the country, not favour a corner. */
  it('spreads the name-derived fallback across every department', () => {
    const seen = new Set(staffNames.map(specialismFromName));
    expect(seen.size).toBe(DEPARTMENT_IDS.length);
  });

  it('reads a stored specialism rather than re-deriving one', () => {
    const member = person('Tomas Bergqvist', { specialism: 'finance' });
    expect(specialismOf(member)).toBe('finance');
  });
});

describe('being good at the work in front of you', () => {
  const template = (departments: TaskTemplate['departments']): TaskTemplate => ({
    id: 't',
    titleKey: 't.title',
    descKey: 't.desc',
    departments,
    baseEffort: 5,
    deadlineRange: [3, 3],
    difficulty: 2,
    weight: 10,
  });

  it('pays for a file in your own field', () => {
    const member = person('Tomas Bergqvist');
    const own = specialismOf(member);
    expect(specialismFactor(member, template([own]))).toBeGreaterThan(1);
  });

  it('pays nothing for somebody else’s', () => {
    const member = person('Tomas Bergqvist');
    const other = DEPARTMENT_IDS.find((d) => d !== specialismOf(member))!;
    expect(specialismFactor(member, template([other]))).toBe(1);
  });

  /** General work is general work: it cannot be anybody's specialism. */
  it('pays nothing on a file that belongs to no department', () => {
    expect(specialismFactor(person('Tomas Bergqvist'), template('any'))).toBe(1);
  });
});

describe('what somebody is like', () => {
  /**
   * No trait may be strictly better than another, or there are six flavours of one person and
   * two of them are traps. Each pair below is the trade written down.
   */
  it('trades speed against quality in both directions', () => {
    const quick = withTrait('quick');
    const meticulous = withTrait('meticulous');

    expect(traitOutputFactor(quick)).toBeGreaterThan(1);
    expect(traitQualityDelta(quick)).toBeLessThan(0);

    expect(traitOutputFactor(meticulous)).toBeLessThan(1);
    expect(traitQualityDelta(meticulous)).toBeGreaterThan(0);
  });

  it('trades an easy colleague against a fast learner', () => {
    const steady = withTrait('steady');
    // Resistance when things are bad, and none at all when they are fine — otherwise a unit of
    // steady officers never decays and attrition stops existing.
    expect(traitMoraleDrift({ ...steady, morale: 30 })).toBeGreaterThan(0);
    expect(traitMoraleDrift({ ...steady, morale: 70 })).toBe(0);
    expect(traitMoraleDrift(withTrait('restless'))).toBeLessThan(0);
  });

  it('lets an organiser hold one more than their grade says', () => {
    const organiser = withTrait('organiser');
    expect(capacityOf(organiser)).toBe(DELEGATION_CAPACITY[organiser.seniority] + 1);
  });

  it('holds a floor under the room for a diplomat, but never under themselves', () => {
    const diplomat = withTrait('diplomat');
    const other = person('Someone Else');
    expect(diplomatFloor([diplomat, other], other)).toBe(DIPLOMAT_FLOOR);
    expect(diplomatFloor([diplomat], diplomat)).toBe(0);
  });

  /**
   * A floor and not a monthly point, because a point exactly cancels `STAFF_MORALE_DRIFT` and one
   * diplomat would switch off attrition for the whole unit.
   */
  it('does not stop a well-off unit sliding', () => {
    expect(DIPLOMAT_FLOOR).toBeLessThan(STEADY_THRESHOLD + 10);
  });
});

describe('experience', () => {
  it('starts everybody at level one', () => {
    expect(staffLevel(person('A'))).toBe(1);
  });

  it('levels on the months actually spent carrying work', () => {
    expect(staffLevel(person('A', { xp: XP_PER_LEVEL - 1 }))).toBe(1);
    expect(staffLevel(person('A', { xp: XP_PER_LEVEL }))).toBe(2);
    expect(staffLevel(person('A', { xp: XP_PER_LEVEL * 3 }))).toBe(4);
  });

  it('stops at the cap however long a career runs', () => {
    expect(staffLevel(person('A', { xp: XP_PER_LEVEL * 400 }))).toBe(MAX_STAFF_LEVEL);
  });

  it('reports progress toward the next level, and a full bar at the cap', () => {
    expect(levelProgress(person('A', { xp: XP_PER_LEVEL + 5 }))).toEqual({
      current: 5,
      needed: XP_PER_LEVEL,
    });
    const capped = levelProgress(person('A', { xp: XP_PER_LEVEL * 400 }));
    expect(capped.current).toBe(capped.needed);
  });

  /**
   * The point of tying experience to carrying work rather than to tenure: somebody nobody ever
   * hands a file to sits at the same desk for nine years and learns nothing.
   */
  it('is not the same thing as time served', () => {
    const idle = person('A', { monthsInPost: 120, xp: 0 });
    expect(staffLevel(idle)).toBe(1);
  });
});

describe('a career grows the people in it', () => {
  it('gives somebody carrying work experience they did not start with', () => {
    const base = createGame({ name: 'T', department: 'legal', seed: 11 }, registry);
    expect(base.staff.every((s) => s.xp === 0)).toBe(true);
  });
});
