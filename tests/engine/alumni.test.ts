/**
 * The people who used to work for you.
 *
 * The first half of this file is the spike the plan called for: proving that authored prose can
 * name a generated person, in both locales, before any content is written against it. I had
 * assumed it could not — `translate` has interpolated `{name}` since the first commit and the
 * event render path simply never passed anything. The assumption was wrong and cheap to check,
 * which is why it is checked here rather than argued about.
 */

import { describe, expect, it } from 'vitest';
import { ALUMNI_LIMIT, KEEP_ON_MOVE_LIMIT } from '../../src/engine/constants';
import {
  regardFrom,
  remember,
  SPOTLIGHT_FLAG,
  spotlight,
  spotlitAlumnus,
  warmestAlumnus,
} from '../../src/engine/alumni';
import { createGame } from '../../src/engine/newGame';
import { createStaff, resolveAttrition, setupTeamForPost } from '../../src/engine/team';
import { translate } from '../../src/i18n/translate';
import type { GameState, StaffMember } from '../../src/engine/types';
import { makeQuietRegistry } from './fixtures';

const registry = makeQuietRegistry();

function game(): GameState {
  return createGame({ name: 'Test', department: 'finance', seed: 3 }, registry);
}

/** A person, without the ceremony of hiring one properly. */
function person(name: string, overrides: Partial<StaffMember> = {}): StaffMember {
  return {
    id: name,
    name,
    seniority: 'officer',
    xp: 0,
    specialism: 'legal',
    skill: 55,
    morale: 60,
    salary: 2600,
    monthsInPost: 20,
    ...overrides,
  };
}

/* ------------------------------------------------------------------- spike */

describe('prose can name a person the content has never heard of', () => {
  it('interpolates a generated name into authored text', () => {
    // `evt.test.common.body` is a fixture key; the point is that the *value* passed in is a proper
    // noun that appears in no dictionary, and survives the lookup untouched.
    const rendered = translate('en', 'dash.progress', { progress: 'Ada Fixture', required: 9 });
    expect(rendered).toContain('Ada Fixture');
  });

  it('does the same in Spanish, because a name is not a translatable thing', () => {
    const en = translate('en', 'log.staff_left', { name: 'Ada Fixture' });
    const es = translate('es', 'log.staff_left', { name: 'Ada Fixture' });

    expect(en).toContain('Ada Fixture');
    expect(es).toContain('Ada Fixture');
    // The sentence around it is translated even though the name is not.
    expect(es).not.toBe(en);
  });

  it('points the spotlight at one of them, and back at nobody', () => {
    const withPeople = remember(game(), [person('Ada Fixture'), person('Bo Sample')]);

    expect(spotlitAlumnus(withPeople)).toBeUndefined();
    expect(spotlitAlumnus(spotlight(withPeople, 1))?.name).toBe('Bo Sample');
    expect(spotlitAlumnus(spotlight(withPeople, undefined))).toBeUndefined();
  });

  /**
   * The one genuinely awkward decision in the module, and the reason it is written down: an unset
   * flag reads as 0, so a 0-based index would make "the first alumnus" and "nobody" the same
   * value.
   */
  it('treats the unset flag as nobody rather than as the first person', () => {
    const withPeople = remember(game(), [person('Ada Fixture')]);

    expect(withPeople.flags[SPOTLIGHT_FLAG]).toBeUndefined();
    expect(spotlitAlumnus(withPeople)).toBeUndefined();
    expect(spotlitAlumnus(spotlight(withPeople, 0))?.name).toBe('Ada Fixture');
  });
});

/* ------------------------------------------------------------------ roster */

describe('remembering people', () => {
  it('records what they thought of you, centred on nothing in particular', () => {
    expect(regardFrom(person('A', { morale: 80 }))).toBe(30);
    expect(regardFrom(person('B', { morale: 50 }))).toBe(0);
    expect(regardFrom(person('C', { morale: 20 }))).toBe(-30);
  });

  it('keeps the most recent and drops the oldest', () => {
    const many = Array.from({ length: ALUMNI_LIMIT + 4 }, (_, i) => person(`Person ${i}`));
    const state = remember(game(), many);

    expect(state.alumni).toHaveLength(ALUMNI_LIMIT);
    // The first four are gone; the last one is still there.
    expect(state.alumni[0]?.name).toBe('Person 4');
    expect(state.alumni.at(-1)?.name).toBe(`Person ${ALUMNI_LIMIT + 3}`);
  });

  it('is a no-op when nobody left', () => {
    const start = game();
    expect(remember(start, [])).toBe(start);
  });

  it('finds the one who liked you most, breaking ties on recency', () => {
    const state = remember(game(), [
      person('Sour', { morale: 20 }),
      person('Fond', { morale: 90 }),
      person('Also fond', { morale: 90 }),
    ]);

    expect(state.alumni[warmestAlumnus(state)!]?.name).toBe('Also fond');
    expect(warmestAlumnus(game())).toBeUndefined();
  });
});

/* -------------------------------------------------------------- moving on */

describe('taking a new post', () => {
  /** A manager with a full unit, at the tier the fixture gives one to. */
  function managing(): GameState {
    const start = { ...game(), player: { ...game().player, postId: 'post.test.head', level: 3 } };
    return setupTeamForPost(start, registry);
  }

  it('leaves everybody behind by default, and remembers them', () => {
    const before = managing();
    expect(before.staff.length).toBeGreaterThan(0);

    const after = setupTeamForPost(before, registry);

    expect(after.alumni.map((a) => a.name)).toEqual(before.staff.map((s) => s.name));
    // And the new unit is nobody from the old one.
    for (const member of after.staff) {
      expect(before.staff.some((s) => s.id === member.id)).toBe(false);
    }
  });

  it('brings the ones you asked for, intact', () => {
    const before = managing();
    const chosen = before.staff.slice(0, 2);
    const after = setupTeamForPost(
      before,
      registry,
      chosen.map((s) => s.id),
    );

    for (const member of chosen) {
      const brought = after.staff.find((s) => s.id === member.id);
      expect(brought).toBeDefined();
      // Skill, morale and tenure survive the move — that is the entire point of bringing them.
      expect(brought?.skill).toBe(member.skill);
      expect(brought?.morale).toBe(member.morale);
      expect(brought?.monthsInPost).toBe(member.monthsInPost);
    }

    // The unit does not grow: they fill establishment slots rather than adding to them.
    expect(after.staff).toHaveLength(before.staff.length);
    expect(after.alumni.map((a) => a.name)).not.toContain(chosen[0]!.name);
  });

  it('will not let you take the whole office', () => {
    const before = managing();
    const after = setupTeamForPost(
      before,
      registry,
      before.staff.map((s) => s.id),
    );

    const brought = after.staff.filter((s) => before.staff.some((old) => old.id === s.id));
    expect(brought).toHaveLength(KEEP_ON_MOVE_LIMIT);
  });

  it('cannot bring anyone to a post with no unit at all', () => {
    const before = managing();
    const specialist = {
      ...before,
      player: { ...before.player, postId: 'post.test.specialist', track: 'expert' as const },
    };
    const after = setupTeamForPost(specialist, registry, [before.staff[0]!.id]);

    expect(after.staff).toEqual([]);
    // Losing them is not silent: they are all remembered, and the log says so.
    expect(after.alumni).toHaveLength(before.staff.length);
    expect(after.log.at(-1)?.messageKey).toBe('log.unit_handed_over');
  });
});

describe('resigning', () => {
  it('puts a leaver on the roster rather than deleting them', () => {
    // Morale far below the attrition threshold, so the roll is as close to certain as it gets.
    const hired = createStaff(game(), registry, 'officer');
    const doomed = { ...hired.staff, morale: 1 };
    let state: GameState = {
      ...hired.state,
      player: { ...hired.state.player, postId: 'post.test.head', level: 3 },
      staff: [doomed],
    };

    // Roll until it fires; the point is what happens when it does, not how likely it is.
    for (let i = 0; i < 200 && state.staff.length > 0; i += 1) {
      state = resolveAttrition(state, registry).state;
    }

    expect(state.staff).toHaveLength(0);
    expect(state.alumni.map((a) => a.name)).toEqual([doomed.name]);
    expect(state.alumni[0]?.regard).toBe(regardFrom(doomed));
  });
});

describe('handing the whole unit over', () => {
  /**
   * The expert fork destroys an office it took years to build. That used to be a log line; it is
   * now a scene, reached the way every other scene is — the engine states a fact and content
   * decides what it means, exactly as `minister_track` has always worked.
   */
  it('leaves the engine a fact for content to make something of', () => {
    const managed = setupTeamForPost(
      { ...game(), player: { ...game().player, postId: 'post.test.head', level: 3 } },
      registry,
    );
    expect(managed.staff.length).toBeGreaterThan(0);

    const specialist = setupTeamForPost(
      { ...managed, player: { ...managed.player, postId: 'post.test.specialist', track: 'expert' } },
      registry,
    );

    expect(specialist.flags.handed_over_unit).toBe(true);
  });

  it('says nothing when there was no unit to hand over', () => {
    // Arriving at a specialist post from a desk with nobody on it is not a hand-over, and firing
    // a scene about introducing your people to your successor would be absurd.
    const soloist = setupTeamForPost(
      { ...game(), player: { ...game().player, postId: 'post.test.specialist', track: 'expert' } },
      registry,
    );

    expect(soloist.flags.handed_over_unit).toBeUndefined();
  });
});
