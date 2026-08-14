import { describe, expect, it } from 'vitest';
import { createGame } from '../../src/engine/newGame';
import {
  allocationTotal,
  beginNextTurn,
  effortAvailable,
  emptyAllocation,
  normalizeAllocation,
  resolveTurn,
} from '../../src/engine/turn';
import type { Allocation, GameState } from '../../src/engine/types';
import { makeQuietRegistry } from './fixtures';

const registry = makeQuietRegistry();

function game(seed = 12): GameState {
  return createGame({ name: 'Test', department: 'finance', seed }, registry);
}

function allocate(overrides: Partial<Allocation> = {}): Allocation {
  return { ...emptyAllocation(), ...overrides };
}

/** Pour every available point into the first task on the board. */
function allIntoFirstTask(state: GameState, overrides: Partial<Allocation> = {}): Allocation {
  const uid = state.tasks[0]!.uid;
  const points = effortAvailable(state, registry, overrides.overtime ?? false);
  return allocate({ tasks: { [uid]: points }, ...overrides });
}

describe('effort budget', () => {
  it('gives the level its documented points, plus overtime', () => {
    const state = game();
    expect(effortAvailable(state, registry, false)).toBe(10);
    expect(effortAvailable(state, registry, true)).toBe(13);
  });

  it('sums an allocation across tasks and personal time', () => {
    const total = allocationTotal({ tasks: { a: 3, b: 2 }, rest: 1, networking: 4, overtime: false });
    expect(total).toBe(10);
  });

  it('trims an over-budget allocation instead of throwing', () => {
    const state = game();
    const greedy: Allocation = {
      tasks: Object.fromEntries(state.tasks.map((t) => [t.uid, 99])),
      rest: 5,
      networking: 5,
      overtime: false,
    };
    const normalized = normalizeAllocation(state, registry, greedy);
    expect(allocationTotal(normalized)).toBe(10);
  });

  it('ignores negative and fractional points', () => {
    const state = game();
    const uid = state.tasks[0]!.uid;
    const messy: Allocation = { tasks: { [uid]: 3.7 }, rest: -4, networking: 0, overtime: false };
    const normalized = normalizeAllocation(state, registry, messy);
    expect(normalized.tasks[uid]).toBe(3);
    expect(normalized.rest).toBe(0);
  });
});

describe('resolveTurn', () => {
  it('moves effort onto tasks', () => {
    const state = game();
    const uid = state.tasks[0]!.uid;
    const next = resolveTurn(state, registry, allocate({ tasks: { [uid]: 2 } }));
    const task = next.tasks.find((t) => t.uid === uid);
    expect(task?.progress).toBe(2);
  });

  it('completes a task once its requirement is met and scores it', () => {
    // Pinned rather than relying on whichever template happened to spawn first: what is on the
    // board depends on content, and this is testing the engine.
    const base = game();
    const state: GameState = {
      ...base,
      tasks: [
        {
          uid: 'only',
          templateId: 'task.test.easy',
          progress: 0,
          required: 4,
          difficulty: 1,
          deadlineTurn: base.turn + 2,
          spawnedTurn: base.turn,
        },
      ],
    };

    const next = resolveTurn(state, registry, allocate({ tasks: { only: 4 } }));

    expect(next.lastReport?.completed).toHaveLength(1);
    expect(['poor', 'good', 'excellent']).toContain(next.lastReport!.completed[0]!.tier);
    expect(next.tasks.some((t) => t.uid === 'only')).toBe(false);
  });

  it('fails tasks whose deadline arrives unfinished, and hurts the stats for it', () => {
    const state = game();
    // Fast-forward past every deadline without doing any work.
    const overdue: GameState = {
      ...state,
      turn: 10,
      tasks: state.tasks.map((t) => ({ ...t, deadlineTurn: 10 })),
    };
    const next = resolveTurn(overdue, registry, emptyAllocation());

    expect(next.lastReport?.failed).toHaveLength(3);
    expect(next.tasks).toHaveLength(0);
    expect(next.stats.performance).toBeLessThan(overdue.stats.performance);
    expect(next.stats.reputation).toBeLessThan(overdue.stats.reputation);
  });

  it('runs a template failure effect when a deadline is missed', () => {
    const state = game();
    const hard: GameState = {
      ...state,
      turn: 4,
      tasks: [
        {
          uid: 'h1',
          templateId: 'task.test.hard',
          progress: 0,
          required: 9,
          difficulty: 3,
          deadlineTurn: 4,
          spawnedTurn: 1,
        },
      ],
    };
    const next = resolveTurn(hard, registry, emptyAllocation());
    expect(next.scheduledEvents).toContainEqual({ eventId: 'evt.test.followup', onTurn: 5 });
  });

  it('applies baseline stress, overtime stress and rest relief', () => {
    const state = game();

    const idle = resolveTurn(state, registry, emptyAllocation());
    expect(idle.stats.stress).toBe(state.stats.stress + 2);

    const overtime = resolveTurn(state, registry, allocate({ overtime: true }));
    expect(overtime.stats.stress).toBe(state.stats.stress + 2 + 5);

    const rested = resolveTurn(state, registry, allocate({ rest: 2 }));
    expect(rested.stats.stress).toBe(state.stats.stress + 2 - 6);
  });

  it('converts networking points into political capital', () => {
    const state = game();
    const next = resolveTurn(state, registry, allocate({ networking: 3 }));
    expect(next.stats.politicalCapital).toBe(state.stats.politicalCapital + 6);
  });

  it('reports the stat movement for the month', () => {
    const state = game();
    const next = resolveTurn(state, registry, allocate({ networking: 2 }));
    expect(next.lastReport?.statDeltas.politicalCapital).toBe(4);
    expect(next.lastReport?.statDeltas.stress).toBe(2);
  });

  it('lands in the report phase when no events fire', () => {
    const state = game();
    expect(resolveTurn(state, registry, emptyAllocation()).phase).toBe('report');
  });

  it('refuses to run outside the allocation phase', () => {
    const state: GameState = { ...game(), phase: 'report' };
    expect(resolveTurn(state, registry, emptyAllocation())).toBe(state);
  });

  it('is deterministic for a given seed and allocation', () => {
    const a = resolveTurn(game(99), registry, emptyAllocation());
    const b = resolveTurn(game(99), registry, emptyAllocation());
    expect(a).toEqual(b);
  });

  it('leaves the previous state untouched', () => {
    const state = game();
    const snapshot = JSON.stringify(state);
    resolveTurn(state, registry, allIntoFirstTask(state));
    expect(JSON.stringify(state)).toBe(snapshot);
  });
});

describe('beginNextTurn', () => {
  it('advances the calendar, ages the post and refills the board', () => {
    const state = resolveTurn(game(), registry, emptyAllocation());
    const next = beginNextTurn(state, registry);

    expect(next.turn).toBe(state.turn + 1);
    expect(next.player.turnsAtLevel).toBe(state.player.turnsAtLevel + 1);
    expect(next.tasks).toHaveLength(3); // the fixture registry keeps level 1 at three slots
    expect(next.phase).toBe('allocation');
  });

  it('only runs from the report phase', () => {
    const state = game();
    expect(beginNextTurn(state, registry)).toBe(state);
  });
});

describe('a full month, repeatedly', () => {
  it('survives twenty turns of doing nothing without breaking its invariants', () => {
    let state = game(7);
    for (let i = 0; i < 20 && !state.ending; i += 1) {
      state = resolveTurn(state, registry, emptyAllocation());
      if (state.phase === 'report') state = beginNextTurn(state, registry);
    }

    for (const value of Object.values(state.stats)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
    expect(state.log.length).toBeLessThanOrEqual(60);
  });
});
