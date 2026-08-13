import { describe, expect, it } from 'vitest';
import { createGame } from '../../src/engine/newGame';
import {
  isComplete,
  isDue,
  isTemplateEligible,
  refillBoard,
  rollQuality,
  scaleEffort,
  spawnTask,
  tierForScore,
} from '../../src/engine/tasks';
import type { ActiveTask, GameState } from '../../src/engine/types';
import { makeQuietRegistry, testTasks } from './fixtures';

const registry = makeQuietRegistry();

function game(department: 'legal' | 'finance' = 'finance'): GameState {
  return createGame({ name: 'Test', department, seed: 4 }, registry);
}

function task(overrides: Partial<ActiveTask> = {}): ActiveTask {
  return {
    uid: 't1',
    templateId: 'task.test.easy',
    progress: 4,
    required: 4,
    difficulty: 1,
    deadlineTurn: 3,
    spawnedTurn: 1,
    ...overrides,
  };
}

describe('effort scaling', () => {
  it('leaves level 1 alone and grows with the post', () => {
    expect(scaleEffort(10, 1)).toBe(10);
    expect(scaleEffort(10, 3)).toBe(12);
    expect(scaleEffort(10, 5)).toBe(15);
  });

  it('never scales a task below one point', () => {
    expect(scaleEffort(1, 1)).toBeGreaterThanOrEqual(1);
  });
});

describe('eligibility', () => {
  it('matches department-restricted templates only to that department', () => {
    const legalOnly = testTasks.find((t) => t.id === 'task.test.legal_only')!;
    expect(isTemplateEligible(legalOnly, game('legal'))).toBe(true);
    expect(isTemplateEligible(legalOnly, game('finance'))).toBe(false);
  });

  it("lets 'any' templates land on every desk", () => {
    const shared = testTasks.find((t) => t.id === 'task.test.easy')!;
    expect(isTemplateEligible(shared, game('legal'))).toBe(true);
    expect(isTemplateEligible(shared, game('finance'))).toBe(true);
  });
});

describe('spawning and refilling', () => {
  it('fills the board to the level slot count', () => {
    const state = game();
    // createGame already refills, so the board should be full at level 1: three slots.
    expect(state.tasks).toHaveLength(3);
  });

  it('gives each task a unique uid', () => {
    const state = game();
    const uids = state.tasks.map((t) => t.uid);
    expect(new Set(uids).size).toBe(uids.length);
  });

  it('rolls deadlines inside the template range', () => {
    const state = game();
    for (const active of state.tasks) {
      const template = registry.tasks[active.templateId]!;
      const [min, max] = template.deadlineRange;
      expect(active.deadlineTurn - active.spawnedTurn).toBeGreaterThanOrEqual(min);
      expect(active.deadlineTurn - active.spawnedTurn).toBeLessThanOrEqual(max);
    }
  });

  it('prefers work not already on the desk', () => {
    const state = { ...game(), tasks: [] };
    const filled = refillBoard(state, registry);
    const templateIds = filled.tasks.map((t) => t.templateId);
    // The finance desk has two eligible templates, so a three-slot board must reuse exactly one.
    expect(new Set(templateIds).size).toBe(2);
  });

  it('stops cleanly when no template is eligible', () => {
    const emptyRegistry = { ...registry, tasks: {} };
    const state = { ...game(), tasks: [] };
    expect(refillBoard(state, emptyRegistry).tasks).toHaveLength(0);
  });

  it('advances the rng cursor when it spawns', () => {
    const state = { ...game(), tasks: [] };
    const next = spawnTask(state, testTasks[0]!);
    expect(next.rngState).not.toBe(state.rngState);
    expect(next.nextTaskUid).toBe(state.nextTaskUid + 1);
  });
});

describe('completion and deadlines', () => {
  it('counts a task complete once progress reaches the requirement', () => {
    expect(isComplete(task({ progress: 3, required: 4 }))).toBe(false);
    expect(isComplete(task({ progress: 4, required: 4 }))).toBe(true);
    expect(isComplete(task({ progress: 6, required: 4 }))).toBe(true);
  });

  it('counts a task due on its deadline turn, not after it', () => {
    expect(isDue(task({ deadlineTurn: 5 }), 4)).toBe(false);
    expect(isDue(task({ deadlineTurn: 5 }), 5)).toBe(true);
    expect(isDue(task({ deadlineTurn: 5 }), 6)).toBe(true);
  });
});

describe('quality scoring', () => {
  it('maps scores onto tiers at the documented thresholds', () => {
    expect(tierForScore(74)).toBe('good');
    expect(tierForScore(75)).toBe('excellent');
    expect(tierForScore(45)).toBe('good');
    expect(tierForScore(44)).toBe('poor');
  });

  it('rewards finishing early', () => {
    const state = { ...game(), turn: 1 };
    const late = rollQuality(state, task({ deadlineTurn: 1 }));
    const early = rollQuality(state, task({ deadlineTurn: 4 }));
    expect(early.score).toBeGreaterThan(late.score);
  });

  it('rewards effort beyond the minimum, up to the cap', () => {
    const state = { ...game(), turn: 1 };
    const minimal = rollQuality(state, task({ progress: 4, required: 4 }));
    const generous = rollQuality(state, task({ progress: 8, required: 4 }));
    const excessive = rollQuality(state, task({ progress: 20, required: 4 }));
    expect(generous.score).toBeGreaterThan(minimal.score);
    expect(excessive.score).toBe(generous.score);
  });

  it('punishes difficulty and stress', () => {
    const calm = { ...game(), turn: 1 };
    const frazzled = { ...calm, stats: { ...calm.stats, stress: 90 } };

    expect(rollQuality(calm, task({ difficulty: 3 })).score).toBeLessThan(
      rollQuality(calm, task({ difficulty: 1 })).score,
    );
    expect(rollQuality(frazzled, task()).score).toBeLessThan(rollQuality(calm, task()).score);
  });

  it('is deterministic for a given rng cursor', () => {
    const state = { ...game(), turn: 1 };
    expect(rollQuality(state, task())).toEqual(rollQuality(state, task()));
  });
});
