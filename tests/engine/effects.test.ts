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

describe('statDeltas', () => {
  it('reports only the stats that moved', () => {
    const before = { reputation: 20, performance: 50, politicalCapital: 10, integrity: 70, stress: 20 };
    const after = { ...before, reputation: 26, stress: 15 };
    expect(statDeltas(before, after)).toEqual({ reputation: 6, stress: -5 });
  });
});

describe('cloneState', () => {
  it('detaches nested collections', () => {
    const start = game();
    const copy = cloneState(start);
    copy.stats.reputation = 99;
    copy.flags.tampered = true;
    copy.tasks.push({ ...copy.tasks[0]!, uid: 'x' });

    expect(start.stats.reputation).not.toBe(99);
    expect(start.flags.tampered).toBeUndefined();
    expect(start.tasks).not.toHaveLength(copy.tasks.length);
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
