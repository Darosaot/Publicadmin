import { describe, expect, it } from 'vitest';
import {
  AGENCY_TEMP_MAX,
  BUDGET_YEAR_MONTHS,
  COACHING_EFFORT_COST,
  DELEGATION_CAPACITY,
  DELEGATION_EFFORT_COST,
  ONE_TO_ONE_EFFORT_COST,
  POACHING_SKILL,
  STAFF_ATTRITION_MORALE,
  STAFF_SALARY,
} from '../../src/engine/constants';
import { applyEffects, conditionMet } from '../../src/engine/effects';
import { createGame } from '../../src/engine/newGame';
import {
  adjustStaffMorale,
  applyAssignments,
  averageMorale,
  createStaff,
  delegatedQualityBase,
  hasTeam,
  promoteStaff,
  resolveAttrition,
  resolveBudget,
  resolveStaffMonth,
  setupTeamForPost,
  staffCost,
  staffOutput,
  startHiring,
} from '../../src/engine/team';
import {
  allocationTotal,
  effortAvailable,
  emptyAllocation,
  managementCost,
  normalizeAllocation,
  resolveTurn,
} from '../../src/engine/turn';
import type { Allocation, GameState, StaffMember } from '../../src/engine/types';
import { makeQuietRegistry } from './fixtures';

const registry = makeQuietRegistry();

function junior(seed = 3): GameState {
  return createGame({ name: 'Test', department: 'finance', seed }, registry);
}

/** A state at the fixture's first management level, with the unit it comes with. */
function manager(seed = 3, overrides: Partial<GameState> = {}): GameState {
  const base = junior(seed);
  const promoted: GameState = {
    ...base,
    player: { ...base.player, postId: 'post.test.head', level: 3, track: 'line' },
    ...overrides,
  };
  return setupTeamForPost(promoted, registry);
}

function allocate(overrides: Partial<Allocation> = {}): Allocation {
  return { ...emptyAllocation(), ...overrides };
}

function staff(overrides: Partial<StaffMember> = {}): StaffMember {
  return {
    id: 'x1',
    name: 'Test Person',
    seniority: 'officer',
    xp: 0,
    specialism: 'legal',
    skill: 60,
    morale: 60,
    salary: STAFF_SALARY.officer,
    monthsInPost: 3,
    ...overrides,
  };
}

describe('who has a unit', () => {
  it('gives no team to a junior post', () => {
    const state = junior();
    expect(hasTeam(state, registry)).toBe(false);
    expect(state.staff).toHaveLength(0);
    expect(state.budget).toBeUndefined();
  });

  it('hands over a unit and a budget on reaching a management post', () => {
    const state = manager();
    expect(hasTeam(state, registry)).toBe(true);
    expect(state.budget?.monthly).toBeGreaterThan(0);
  });

  it('arrives one short of the establishment, so there is a post to fill', () => {
    const state = manager();
    const headcount = registry.posts.find((p) => p.id === 'post.test.head')!.headcount!;
    expect(state.staff).toHaveLength(headcount - 1);
  });

  it('gives everyone a distinct name and id', () => {
    const state = manager();
    expect(new Set(state.staff.map((s) => s.name)).size).toBe(state.staff.length);
    expect(new Set(state.staff.map((s) => s.id)).size).toBe(state.staff.length);
  });

  it('hands the unit over when the new post has none, and says so', () => {
    // Moving onto the expert track costs you the whole unit. Doing that silently would be the
    // engine deleting years of the player's work without telling them.
    const before = manager();
    const stripped = setupTeamForPost(
      { ...before, player: { ...before.player, postId: 'post.test.specialist', track: 'expert' } },
      registry,
    );

    expect(stripped.staff).toHaveLength(0);
    expect(stripped.budget).toBeUndefined();
    expect(stripped.log.at(-1)?.messageKey).toBe('log.unit_handed_over');
  });

  it('says nothing about a handover when there was no unit to hand over', () => {
    const start = junior();
    const stripped = setupTeamForPost(start, registry);
    expect(stripped.log.some((l) => l.messageKey === 'log.unit_handed_over')).toBe(false);
  });
});

describe('what a person delivers', () => {
  it('rises with grade', () => {
    const base = { skill: 60, morale: 60 };
    expect(staffOutput(staff({ ...base, seniority: 'junior' }))).toBeLessThan(
      staffOutput(staff({ ...base, seniority: 'officer' })),
    );
    expect(staffOutput(staff({ ...base, seniority: 'officer' }))).toBeLessThan(
      staffOutput(staff({ ...base, seniority: 'senior' })),
    );
  });

  it('rises with skill and with morale', () => {
    expect(staffOutput(staff({ skill: 20 }))).toBeLessThan(staffOutput(staff({ skill: 90 })));
    expect(staffOutput(staff({ morale: 20 }))).toBeLessThan(staffOutput(staff({ morale: 90 })));
  });

  it('is never zero, however miserable they are', () => {
    expect(staffOutput(staff({ skill: 0, morale: 0, seniority: 'junior' }))).toBeGreaterThan(0);
  });

  it('lets a neglected expert fall behind a cared-for ordinary officer', () => {
    const neglectedExpert = staff({ seniority: 'senior', skill: 95, morale: 10 });
    const lookedAfter = staff({ seniority: 'senior', skill: 55, morale: 95 });
    expect(staffOutput(lookedAfter)).toBeGreaterThanOrEqual(staffOutput(neglectedExpert));
  });

  it('judges a delegated file on the person who carried it', () => {
    expect(delegatedQualityBase(staff({ skill: 90, morale: 90 }))).toBeGreaterThan(
      delegatedQualityBase(staff({ skill: 30, morale: 30 })),
    );
  });
});

describe('the cost of managing', () => {
  it('charges effort for delegating, coaching, one-to-ones and recruiting', () => {
    const state = manager();
    const [a, b] = state.staff;
    const allocation = allocate({
      delegations: { [state.tasks[0]!.uid]: a!.id },
      coaching: [a!.id],
      oneToOnes: [b!.id],
      recruiting: true,
    });

    expect(managementCost(state, allocation)).toBe(
      DELEGATION_EFFORT_COST + COACHING_EFFORT_COST + ONE_TO_ONE_EFFORT_COST + 2,
    );
    expect(allocationTotal(state, allocation)).toBe(managementCost(state, allocation));
  });

  it('drops delegations to people who do not work here', () => {
    const state = manager();
    const allocation = allocate({ delegations: { [state.tasks[0]!.uid]: 'nobody' } });
    expect(normalizeAllocation(state, registry, allocation).delegations).toEqual({});
  });

  /**
   * Before the cap you could put one senior on the whole board and be paid their full output on
   * every file — free work, and the reason a unit's size never really constrained anything.
   */
  it('will not hand anyone more files than they can carry', () => {
    const state = manager();
    const senior = state.staff.find((s) => s.seniority === 'senior')!;
    const delegations = Object.fromEntries(state.tasks.map((task) => [task.uid, senior.id]));

    const normalized = normalizeAllocation(state, registry, allocate({ delegations }));
    const carried = Object.values(normalized.delegations).filter((id) => id === senior.id);

    expect(state.tasks.length).toBeGreaterThan(DELEGATION_CAPACITY.senior);
    expect(carried).toHaveLength(DELEGATION_CAPACITY.senior);
  });

  it('splits a month between the files one person is carrying', () => {
    const state = manager();
    const senior = state.staff.find((s) => s.seniority === 'senior')!;
    const [first, second] = state.tasks;

    const alone = resolveTurn(state, registry, allocate({ delegations: { [first!.uid]: senior.id } }));
    const shared = resolveTurn(
      state,
      registry,
      allocate({ delegations: { [first!.uid]: senior.id, [second!.uid]: senior.id } }),
    );

    const progressOf = (result: GameState, uid: string) =>
      result.lastReport?.team?.delegatedProgress.find(
        (entry) => entry.taskTemplateId === state.tasks.find((t) => t.uid === uid)?.templateId,
      )?.progress ?? 0;

    // Two files move at once, but neither gets a whole month's work.
    expect(progressOf(shared, first!.uid)).toBeLessThan(progressOf(alone, first!.uid));
    expect(progressOf(shared, second!.uid)).toBeGreaterThan(0);
  });

  it('ignores management entirely for a player with no unit', () => {
    const state = junior();
    const allocation = allocate({ coaching: ['x'], oneToOnes: ['y'], agencyTemps: 2 });
    const normalized = normalizeAllocation(state, registry, allocation);

    expect(normalized.coaching).toEqual([]);
    expect(normalized.oneToOnes).toEqual([]);
    expect(normalized.agencyTemps).toBe(0);
  });

  it('buys effort with agency cover, up to a limit', () => {
    const state = manager();
    const base = effortAvailable(state, registry, false);
    expect(effortAvailable(state, registry, false, 2)).toBeGreaterThan(base);
    expect(effortAvailable(state, registry, false, 99)).toBe(
      effortAvailable(state, registry, false, AGENCY_TEMP_MAX),
    );
  });
});

describe('delegation in a real month', () => {
  it('moves a file forward without the player touching it', () => {
    const base = manager(11);
    const carrier = base.staff[0]!;
    const state: GameState = {
      ...base,
      tasks: [
        {
          uid: 'file',
          templateId: 'task.test.easy',
          progress: 0,
          required: 20,
          difficulty: 1,
          deadlineTurn: base.turn + 5,
          spawnedTurn: base.turn,
        },
      ],
    };

    const next = resolveTurn(state, registry, allocate({ delegations: { file: carrier.id } }));
    const file = next.tasks.find((t) => t.uid === 'file');

    expect(file!.progress).toBe(staffOutput(carrier));
    expect(next.lastReport?.team?.delegatedProgress[0]?.staffName).toBe(carrier.name);
  });

  it('costs the person morale when the file they were carrying is missed', () => {
    const base = manager(11);
    /*
     * Skill pinned below `POACHING_SKILL`, so the only thing that can move this person's morale
     * is the file they were carrying. Left as rolled, they were quietly poached in the same month
     * and the assertion below read `undefined.morale` — a test measuring one mechanic knocked
     * over by an unrelated one that happened to fire on this seed.
     */
    const carrier = { ...base.staff[0]!, skill: POACHING_SKILL - 10 };
    const state: GameState = {
      ...base,
      staff: [carrier, ...base.staff.slice(1)],
      turn: 5,
      tasks: [
        {
          uid: 'doomed',
          templateId: 'task.test.hard',
          progress: 0,
          required: 200,
          difficulty: 3,
          deadlineTurn: 5,
          spawnedTurn: 1,
        },
      ],
    };

    const next = resolveTurn(state, registry, allocate({ delegations: { doomed: carrier.id } }));
    const after = next.staff.find((s) => s.id === carrier.id)!;

    expect(next.lastReport?.failed).toHaveLength(1);
    expect(after.morale).toBeLessThan(carrier.morale);
  });

  it('forgets assignments to people who have left', () => {
    const base = manager();
    const withAssignment = applyAssignments(base, allocate({ delegations: { [base.tasks[0]!.uid]: base.staff[0]!.id } }));
    expect(withAssignment.tasks[0]!.assignedTo).toBe(base.staff[0]!.id);

    const gone: GameState = { ...withAssignment, staff: [] };
    const cleared = applyAssignments(gone, emptyAllocation());
    expect(cleared.tasks[0]!.assignedTo).toBeUndefined();
  });
});

describe('attention', () => {
  it('coaching raises skill and one-to-ones raise morale', () => {
    const base = manager(21);
    const [a, b] = base.staff;

    const { state: next } = resolveStaffMonth(
      base,
      registry,
      allocate({ coaching: [a!.id], oneToOnes: [b!.id] }),
    );

    expect(next.staff.find((s) => s.id === a!.id)!.skill).toBeGreaterThan(a!.skill);
    expect(next.staff.find((s) => s.id === b!.id)!.morale).toBeGreaterThan(b!.morale);
  });

  it('lets morale rot when nobody is looked after', () => {
    const base = manager(21);
    const { state: next } = resolveStaffMonth(base, registry, emptyAllocation());
    expect(averageMorale(next)).toBeLessThan(averageMorale(base));
  });

  it('promotes someone up a grade, with the pay and the lift that follow', () => {
    const base = manager();
    const person = base.staff.find((s) => s.seniority === 'junior') ?? base.staff[0]!;
    const next = promoteStaff(base, person.id);
    const after = next.staff.find((s) => s.id === person.id)!;

    if (person.seniority !== 'senior') {
      expect(after.seniority).not.toBe(person.seniority);
      expect(after.salary).toBeGreaterThan(person.salary);
    }
    expect(after.morale).toBeGreaterThan(person.morale);
  });
});

describe('recruitment', () => {
  it('takes months, and only advances when you work at it', () => {
    let state = startHiring(manager(31), 'officer');
    const months = state.hiring!.monthsRemaining;
    expect(months).toBeGreaterThan(1);

    // Not recruiting this month: nothing moves.
    state = resolveStaffMonth(state, registry, emptyAllocation()).state;
    expect(state.hiring!.monthsRemaining).toBe(months);

    let arrivals = 0;
    for (let i = 0; i < months && state.hiring; i += 1) {
      const result = resolveStaffMonth(state, registry, allocate({ recruiting: true }));
      state = result.state;
      arrivals += result.report.arrivals.length;
    }

    expect(state.hiring).toBeUndefined();
    expect(arrivals).toBe(1);
  });

  it('will not start a second search while one is running', () => {
    const state = startHiring(manager(), 'senior');
    expect(startHiring(state, 'junior').hiring?.seniority).toBe('senior');
  });
});

describe('attrition', () => {
  it('leaves a contented unit alone', () => {
    const base = manager(41);
    const happy: GameState = {
      ...base,
      staff: base.staff.map((s) => ({ ...s, morale: 90 })),
    };
    for (let seed = 0; seed < 30; seed += 1) {
      const result = resolveAttrition({ ...happy, rngState: seed * 7919 }, registry);
      expect(result.report.departures).toHaveLength(0);
    }
  });

  it('eventually loses someone who has been ground down', () => {
    const base = manager(41);
    const miserable: GameState = {
      ...base,
      staff: base.staff.map((s) => ({ ...s, morale: 3 })),
    };

    let departures = 0;
    for (let seed = 0; seed < 40; seed += 1) {
      departures += resolveAttrition({ ...miserable, rngState: seed * 7919 }, registry).report
        .departures.length;
    }
    expect(departures).toBeGreaterThan(0);
  });

  it('hands back whatever the leaver was carrying', () => {
    const base = manager(41);
    const carrier = base.staff[0]!;
    const state: GameState = {
      ...base,
      staff: base.staff.map((s) => (s.id === carrier.id ? { ...s, morale: 0 } : { ...s, morale: 95 })),
      tasks: base.tasks.map((t, i) => (i === 0 ? { ...t, assignedTo: carrier.id } : t)),
    };

    let found = false;
    for (let seed = 0; seed < 40 && !found; seed += 1) {
      const result = resolveAttrition({ ...state, rngState: seed * 7919 }, registry);
      if (result.report.departures.length > 0) {
        found = true;
        expect(result.state.tasks[0]!.assignedTo).toBeUndefined();
      }
    }
    expect(found).toBe(true);
  });

  it('only looks at people below the threshold', () => {
    const base = manager(41);
    const borderline: GameState = {
      ...base,
      staff: base.staff.map((s) => ({ ...s, morale: STAFF_ATTRITION_MORALE + 1 })),
    };
    for (let seed = 0; seed < 20; seed += 1) {
      expect(
        resolveAttrition({ ...borderline, rngState: seed * 7919 }, registry).report.departures,
      ).toHaveLength(0);
    }
  });
});

describe('the budget', () => {
  it('charges salaries every month', () => {
    const state = manager(51);
    const cost = staffCost(state);
    expect(cost).toBeGreaterThan(0);

    const result = resolveBudget(state, 0);
    expect(result.delta).toBe(state.budget!.monthly - cost);
    expect(result.state.budget!.balance).toBe(result.delta);
  });

  it('charges discretionary spending on top', () => {
    const state = manager(51);
    const plain = resolveBudget(state, 0).delta;
    expect(resolveBudget(state, 5000).delta).toBe(plain - 5000);
  });

  it('punishes a year that ends overspent', () => {
    const base = manager(51);
    const yearEnd: GameState = {
      ...base,
      calendarMonth: BUDGET_YEAR_MONTHS,
      budget: { ...base.budget!, balance: -base.budget!.monthly * 6 },
    };
    const result = resolveBudget(yearEnd, 0);

    expect(result.verdict).toBe('overspent');
    expect(result.state.stats.reputation).toBeLessThan(base.stats.reputation);
  });

  it('punishes a year that ends underspent, and cuts next year', () => {
    const base = manager(51);
    const yearEnd: GameState = {
      ...base,
      calendarMonth: BUDGET_YEAR_MONTHS,
      budget: { ...base.budget!, balance: base.budget!.monthly * 6 },
    };
    const result = resolveBudget(yearEnd, 0);

    expect(result.verdict).toBe('underspent');
    expect(result.state.budget!.monthly).toBeLessThan(base.budget!.monthly);
  });

  it('starts a clean year afterwards', () => {
    const base = manager(51);
    const yearEnd: GameState = {
      ...base,
      calendarMonth: BUDGET_YEAR_MONTHS,
      budget: { ...base.budget!, balance: 400 },
    };
    const result = resolveBudget(yearEnd, 0);

    expect(result.state.budget!.balance).toBe(0);
    expect(result.state.budget!.yearStartMonth).toBe(yearEnd.calendarMonth);
  });

  /**
   * The budget year used to be counted in turns, which stopped meaning a year the moment a cycle
   * became six months: a Director-General's budget year was six real ones. It is counted in
   * calendar months now, so seniority changes how many *cycles* a year takes and never how long
   * a year is.
   */
  it('judges the year after twelve months however long a cycle is', () => {
    const base = manager(51);

    const twoSeniorCycles: GameState = {
      ...base,
      turn: base.turn + 2,
      calendarMonth: 12,
      budget: { ...base.budget!, balance: base.budget!.monthly * 6 },
    };
    expect(resolveBudget(twoSeniorCycles, 0).verdict).toBe('underspent');

    const elevenJuniorCycles: GameState = {
      ...base,
      turn: base.turn + 11,
      calendarMonth: 11,
      budget: { ...base.budget!, balance: base.budget!.monthly * 6 },
    };
    expect(resolveBudget(elevenJuniorCycles, 0).verdict).toBeUndefined();
  });

  it('does nothing at all for a player with no unit', () => {
    const state = junior();
    expect(resolveBudget(state, 5000)).toEqual({ state, delta: 0 });
  });
});

describe('management effects from events', () => {
  it('moves the whole unit’s morale', () => {
    const base = manager(61);
    const next = applyEffects(base, [{ kind: 'teamMorale', delta: -15 }], registry);
    expect(averageMorale(next)).toBeLessThan(averageMorale(base));
  });

  it('adds and removes people', () => {
    const base = manager(61);
    const bigger = applyEffects(base, [{ kind: 'gainStaff', seniority: 'senior' }], registry);
    expect(bigger.staff).toHaveLength(base.staff.length + 1);

    const smaller = applyEffects(base, [{ kind: 'loseStaff' }], registry);
    expect(smaller.staff).toHaveLength(base.staff.length - 1);
  });

  it('takes the least engaged person when someone has to go', () => {
    const base = manager(61);
    const marked = {
      ...base,
      staff: base.staff.map((s, i) => ({ ...s, morale: i === 1 ? 5 : 80 })),
    };
    const next = applyEffects(marked, [{ kind: 'loseStaff' }], registry);
    expect(next.staff.some((s) => s.id === marked.staff[1]!.id)).toBe(false);
  });

  it('changes the budget, one-off and standing', () => {
    const base = manager(61);
    expect(applyEffects(base, [{ kind: 'budget', delta: -2000 }], registry).budget!.balance).toBe(
      base.budget!.balance - 2000,
    );
    expect(
      applyEffects(base, [{ kind: 'budgetMonthly', delta: 1500 }], registry).budget!.monthly,
    ).toBe(base.budget!.monthly + 1500);
  });

  it('is harmless for a player with no unit', () => {
    const state = junior();
    const next = applyEffects(
      state,
      [
        { kind: 'teamMorale', delta: -20 },
        { kind: 'loseStaff' },
        { kind: 'budget', delta: -5000 },
      ],
      registry,
    );
    expect(next.staff).toHaveLength(0);
    expect(next.budget).toBeUndefined();
  });
});

describe('team conditions', () => {
  it('separates managers from everyone else', () => {
    expect(conditionMet(manager(), { requiresTeam: true })).toBe(true);
    expect(conditionMet(junior(), { requiresTeam: true })).toBe(false);
    expect(conditionMet(junior(), { requiresTeam: false })).toBe(true);
  });

  it('gates on the state of the unit', () => {
    const base = manager(71);
    const unhappy = { ...base, staff: base.staff.map((s) => ({ ...s, morale: 20 })) };

    expect(conditionMet(unhappy, { maxTeamMorale: 30 })).toBe(true);
    expect(conditionMet(unhappy, { minTeamMorale: 60 })).toBe(false);
    expect(conditionMet(base, { minStaffCount: 99 })).toBe(false);
  });
});

describe('determinism with a unit', () => {
  it('replays a managed month identically', () => {
    const state = manager(81);
    const carrier = state.staff[0]!;
    const allocation = allocate({
      delegations: { [state.tasks[0]!.uid]: carrier.id },
      coaching: [carrier.id],
    });

    expect(resolveTurn(state, registry, allocation)).toEqual(
      resolveTurn(state, registry, allocation),
    );
  });

  it('generates people deterministically from the cursor', () => {
    const state = manager(81);
    expect(createStaff(state, registry, 'officer').staff).toEqual(
      createStaff(state, registry, 'officer').staff,
    );
  });

  it('keeps morale inside its range however hard it is pushed', () => {
    const base = manager(81);
    const battered = adjustStaffMorale(base, base.staff[0]!.id, -500);
    const spoiled = adjustStaffMorale(base, base.staff[0]!.id, 500);

    expect(battered.staff[0]!.morale).toBe(0);
    expect(spoiled.staff[0]!.morale).toBe(100);
  });
});
