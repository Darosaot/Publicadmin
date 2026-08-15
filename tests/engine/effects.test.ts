import { describe, expect, it } from 'vitest';
import { applyEffects, checkCondition, cloneState, conditionMet, statDeltas } from '../../src/engine/effects';
import { createGame } from '../../src/engine/newGame';
import type { GameState } from '../../src/engine/types';
import { makeQuietRegistry } from './fixtures';

const registry = makeQuietRegistry();

function game(overrides: Partial<GameState> = {}): GameState {
  const base = createGame({ name: 'Test', department: 'finance', seed: 1 }, registry);
  return { ...base, ...overrides };
}

describe('applyEffects', () => {
  it('clamps stats to 0 and 100', () => {
    const start = game();
    const high = applyEffects(start, [{ kind: 'stat', stat: 'reputation', delta: 500 }], registry);
    const low = applyEffects(start, [{ kind: 'stat', stat: 'integrity', delta: -500 }], registry);

    expect(high.stats.reputation).toBe(100);
    expect(low.stats.integrity).toBe(0);
  });

  it('leaves the input state untouched', () => {
    const start = game();
    const before = start.stats.reputation;
    applyEffects(start, [{ kind: 'stat', stat: 'reputation', delta: 20 }], registry);
    expect(start.stats.reputation).toBe(before);
  });

  it('sets flags, defaulting to true', () => {
    const start = game();
    const next = applyEffects(
      start,
      [
        { kind: 'flag', flag: 'owes_favour' },
        { kind: 'flag', flag: 'clean_record', value: false },
      ],
      registry,
    );
    expect(next.flags.owes_favour).toBe(true);
    expect(next.flags.clean_record).toBe(false);
  });

  it('never lets salary go negative', () => {
    const start = game();
    const next = applyEffects(start, [{ kind: 'salary', delta: -99_999 }], registry);
    expect(next.player.salary).toBe(0);
  });

  it('schedules events with the requested delay', () => {
    const start = game({ turn: 5 });
    const next = applyEffects(
      start,
      [
        { kind: 'queueEvent', eventId: 'evt.test.followup', delayTurns: 3 },
        { kind: 'queueEvent', eventId: 'evt.test.fatal' },
      ],
      registry,
    );
    expect(next.scheduledEvents).toEqual([
      { eventId: 'evt.test.followup', onTurn: 8 },
      { eventId: 'evt.test.fatal', onTurn: 5 },
    ]);
  });

  it('spawns tasks from templates that exist and ignores ones that do not', () => {
    const start = game({ tasks: [] });
    const next = applyEffects(
      start,
      [
        { kind: 'spawnTask', templateId: 'task.test.easy' },
        { kind: 'spawnTask', templateId: 'task.does.not.exist' },
      ],
      registry,
    );
    expect(next.tasks).toHaveLength(1);
    expect(next.tasks[0]?.templateId).toBe('task.test.easy');
  });

  it('short-circuits on endGame so later effects never land', () => {
    const start = game();
    const next = applyEffects(
      start,
      [
        { kind: 'endGame', ending: 'burnout' },
        { kind: 'stat', stat: 'reputation', delta: 50 },
      ],
      registry,
    );
    expect(next.ending).toBe('burnout');
    expect(next.phase).toBe('ended');
    expect(next.stats.reputation).toBe(start.stats.reputation);
  });
});

describe('numeric flags', () => {
  it('moves a flag that does not exist yet, starting from zero', () => {
    const next = applyEffects(
      game(),
      [{ kind: 'flagDelta', flag: 'standing_vasquez', delta: 6 }],
      registry,
    );
    expect(next.flags.standing_vasquez).toBe(6);
  });

  it('accumulates, in both directions', () => {
    let state = applyEffects(
      game(),
      [{ kind: 'flagDelta', flag: 'standing_vasquez', delta: 6 }],
      registry,
    );
    state = applyEffects(
      state,
      [{ kind: 'flagDelta', flag: 'standing_vasquez', delta: -10 }],
      registry,
    );
    expect(state.flags.standing_vasquez).toBe(-4);
  });

  it('leaves the state it was given alone', () => {
    const before = game();
    applyEffects(before, [{ kind: 'flagDelta', flag: 'standing_vasquez', delta: 6 }], registry);
    expect(before.flags.standing_vasquez).toBeUndefined();
  });

  it('promotes a boolean flag to a number rather than failing', () => {
    const next = applyEffects(
      game({ flags: { owed: true } }),
      [{ kind: 'flagDelta', flag: 'owed', delta: 2 }],
      registry,
    );
    expect(next.flags.owed).toBe(3);
  });
});

describe('statDeltas', () => {
  it('reports only the stats that moved', () => {
    const before = { reputation: 20, performance: 50, politicalCapital: 10, integrity: 70, stress: 20 };
    const after = { ...before, reputation: 26, stress: 15 };
    expect(statDeltas(before, after)).toEqual({ reputation: 6, stress: -5 });
  });
});

/**
 * A state with every optional field present and every collection non-empty.
 *
 * The guard below compares references, so anything left `undefined` or absent would be silently
 * skipped — which is the exact failure it exists to catch.
 */
function populatedGame(): GameState {
  return {
    ...game(),
    tasks: [
      {
        uid: 't1',
        templateId: 'task.quiet',
        progress: 2,
        required: 6,
        difficulty: 2,
        deadlineTurn: 5,
        spawnedTurn: 1,
        assignedTo: 's1',
      },
    ],
    staff: [
      {
        id: 's1',
        name: 'Someone',
        seniority: 'officer',
        skill: 55,
        morale: 60,
        salary: 2600,
        monthsInPost: 9,
      },
    ],
    hiring: { seniority: 'senior', monthsRemaining: 3 },
    budget: { monthly: 11500, balance: -400, yearStartMonth: 0, spentThisMonth: 0 },
    pendingEvents: [
      { eventId: 'evt.quiet', resolution: { choiceId: 'c', outcomeIndex: 0, textKey: 'k' } },
    ],
    scheduledEvents: [{ eventId: 'evt.quiet', onTurn: 4 }],
    firedEvents: ['evt.quiet'],
    cooldowns: { 'evt.quiet': 12 },
    flags: { something: true, counted: 3 },
    offers: [
      { id: 'o1', toPost: 'post.x', toTier: 2, salary: 3000, createdTurn: 1, expiresTurn: 4 },
    ],
    sinceReview: { completed: 2, failed: 1 },
    log: [{ turn: 1, messageKey: 'log.x', tone: 'neutral' }],
    lastReport: {
      turn: 1,
      completed: [],
      failed: [],
      statDeltas: {},
      salaryDelta: 0,
      newOffers: [],
    },
  };
}

describe('cloneState', () => {
  /**
   * The trap this exists for.
   *
   * `cloneState` hand-enumerates every mutable field, and `applyEffects` then mutates the clone in
   * place. A field added to `GameState` and forgotten here falls through the spread as a *shared
   * reference*, so applying an effect silently corrupts the caller's pre-effect state — with no
   * type error and no test failure, because nothing was checking the new field.
   *
   * So do not test named fields. Walk the whole object: whatever anyone adds next is covered on
   * the day they add it, and the failure message names the field they forgot.
   *
   * Top level only, deliberately. `lastReport`'s inner arrays are shared by design — `finalizeTurn`
   * rebuilds that object rather than mutating it.
   */
  it('detaches every object and array on the state', () => {
    const start = populatedGame();
    const copy = cloneState(start);

    const shared = (Object.keys(start) as (keyof GameState)[]).filter((key) => {
      const value = start[key];
      return value !== null && typeof value === 'object' && value === copy[key];
    });

    expect(
      shared,
      `cloneState shares these fields with its input — add them to the clone in src/engine/effects.ts`,
    ).toEqual([]);
  });

  it('leaves the original alone when the copy is written to', () => {
    const start = populatedGame();
    const copy = cloneState(start);

    copy.stats.reputation = 99;
    copy.flags.tampered = true;
    copy.tasks.push({ ...copy.tasks[0]!, uid: 'x' });

    expect(start.stats.reputation).not.toBe(99);
    expect(start.flags.tampered).toBeUndefined();
    expect(start.tasks).toHaveLength(1);
  });
});

describe('conditions', () => {
  it('passes when there is no condition at all', () => {
    expect(conditionMet(game(), undefined)).toBe(true);
  });

  it('gates on level range', () => {
    const state = game({ player: { ...game().player, level: 2 } });
    expect(conditionMet(state, { minLevel: 3 })).toBe(false);
    expect(conditionMet(state, { maxLevel: 1 })).toBe(false);
    expect(conditionMet(state, { minLevel: 2, maxLevel: 2 })).toBe(true);
  });

  it('gates on department', () => {
    const state = game();
    expect(conditionMet(state, { departments: ['finance'] })).toBe(true);
    expect(conditionMet(state, { departments: ['legal', 'policy'] })).toBe(false);
  });

  it('gates on stat floors and ceilings', () => {
    const state = game();
    state.stats.politicalCapital = 30;
    expect(conditionMet(state, { minStat: { politicalCapital: 25 } })).toBe(true);
    expect(conditionMet(state, { minStat: { politicalCapital: 45 } })).toBe(false);
    expect(conditionMet(state, { maxStat: { politicalCapital: 20 } })).toBe(false);
  });

  it('gates on required and forbidden flags', () => {
    const state = game({ flags: { has_ally: true } });
    expect(conditionMet(state, { requiredFlags: ['has_ally'] })).toBe(true);
    expect(conditionMet(state, { requiredFlags: ['missing'] })).toBe(false);
    expect(conditionMet(state, { forbiddenFlags: ['has_ally'] })).toBe(false);
    expect(conditionMet(state, { forbiddenFlags: ['missing'] })).toBe(true);
  });

  it('reads a numeric flag against a threshold', () => {
    const state = game({ flags: { standing_vasquez: 35 } });
    expect(conditionMet(state, { minFlag: { standing_vasquez: 30 } })).toBe(true);
    expect(conditionMet(state, { minFlag: { standing_vasquez: 40 } })).toBe(false);
    expect(conditionMet(state, { maxFlag: { standing_vasquez: 40 } })).toBe(true);
    expect(conditionMet(state, { maxFlag: { standing_vasquez: 30 } })).toBe(false);
  });

  it('treats a flag that was never set as zero', () => {
    const state = game();
    expect(conditionMet(state, { minFlag: { never_set: 1 } })).toBe(false);
    expect(conditionMet(state, { maxFlag: { never_set: 0 } })).toBe(true);
  });

  it('reads a boolean flag numerically, so the two kinds mix', () => {
    // Flags started out boolean and some grew into quantities; old and new content has to be
    // able to gate on the same flag without knowing which kind it is.
    const state = game({ flags: { happened: true } });
    expect(conditionMet(state, { minFlag: { happened: 1 } })).toBe(true);
    expect(conditionMet(state, { requiredFlags: ['happened'] })).toBe(true);
  });

  it('reports which requirement failed, so the UI can explain it', () => {
    const state = game();
    state.stats.politicalCapital = 5;
    const failure = checkCondition(state, { minStat: { politicalCapital: 40 } });
    expect(failure).toEqual({
      reason: 'stat',
      stat: 'politicalCapital',
      required: 40,
      comparison: 'min',
    });
  });
});
