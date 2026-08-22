import { describe, expect, it } from 'vitest';
import { REFUSE_REPUTATION_COST } from '../../src/engine/constants';
import { createGame } from '../../src/engine/newGame';
import {
  EXTENSION_TURNS,
  SCOPED_QUALITY_CAP,
  canNegotiate,
  extendDeadline,
  negotiationCost,
  refuseTask,
  scopeDown,
} from '../../src/engine/negotiate';
import { rollQuality, tierForScore } from '../../src/engine/tasks';
import type { GameState } from '../../src/engine/types';
import { makeQuietRegistry } from './fixtures';

const registry = makeQuietRegistry();

function game(politicalCapital = 80): GameState {
  const base = createGame({ name: 'Test', department: 'legal', seed: 4 }, registry);
  return { ...base, stats: { ...base.stats, politicalCapital } };
}

const uid = (state: GameState) => state.tasks[0]!.uid;

describe('moving a date', () => {
  it('buys turns and spends favours', () => {
    const before = game();
    const task = before.tasks[0]!;
    const cost = negotiationCost(task, 'extend');

    const after = extendDeadline(before, registry, task.uid);
    const moved = after.tasks.find((t) => t.uid === task.uid)!;

    expect(moved.deadlineTurn).toBe(task.deadlineTurn + EXTENSION_TURNS);
    expect(after.stats.politicalCapital).toBe(before.stats.politicalCapital - cost);
  });

  /** Without the cap this is an infinite loop against a stat that replenishes. */
  it('can only be done once per file', () => {
    const once = extendDeadline(game(), registry, uid(game()));
    expect(canNegotiate(once, registry, uid(once), 'extend')).toBe(false);
    expect(extendDeadline(once, registry, uid(once))).toBe(once);
  });

  it('costs more on a file barely started than on one nearly done', () => {
    const state = game();
    const barely = state.tasks[0]!;
    const nearly = { ...barely, progress: barely.required - 1 };
    expect(negotiationCost(barely, 'extend')).toBeGreaterThan(negotiationCost(nearly, 'extend'));
  });

  it('is refused when the favours are not there', () => {
    const broke = game(0);
    expect(canNegotiate(broke, registry, uid(broke), 'extend')).toBe(false);
    expect(extendDeadline(broke, registry, uid(broke))).toBe(broke);
  });
});

describe('cutting a file back', () => {
  it('shrinks what is required', () => {
    const before = game();
    const task = before.tasks[0]!;
    const after = scopeDown(before, registry, task.uid);
    const cut = after.tasks.find((t) => t.uid === task.uid)!;

    expect(cut.required).toBeLessThan(task.required);
    expect(cut.scoped).toBe(true);
  });

  /** Otherwise scoping a nearly-finished file completes it outright, for six points of favour. */
  it('never cuts below what has already been put in', () => {
    const state = game();
    const task = state.tasks[0]!;
    const nearlyDone: GameState = {
      ...state,
      tasks: [{ ...task, progress: task.required - 1 }],
    };

    const after = scopeDown(nearlyDone, registry, task.uid);
    const cut = after.tasks.find((t) => t.uid === task.uid)!;
    expect(cut.required).toBeGreaterThan(cut.progress);
  });

  /**
   * The reason scoping is a trade rather than a discount. Without the cap the shortened file
   * scores *better*, because delivering it early is now easy and the early bonus grows.
   */
  it('puts a ceiling on how well the file can come back', () => {
    const state = game();
    const task = { ...state.tasks[0]!, scoped: true, progress: 200, required: 4 };
    const brilliant: GameState = {
      ...state,
      turn: 1,
      stats: { ...state.stats, performance: 100, stress: 0 },
      tasks: [task],
    };

    const roll = rollQuality(brilliant, task, 100);
    expect(roll.score).toBeLessThanOrEqual(SCOPED_QUALITY_CAP);
    expect(roll.tier).not.toBe(tierForScore(999));
  });

  it('can only be done once per file', () => {
    const once = scopeDown(game(), registry, uid(game()));
    expect(canNegotiate(once, registry, uid(once), 'scope')).toBe(false);
  });
});

describe('saying no', () => {
  it('takes the file off the board without failing it', () => {
    const before = game();
    const target = uid(before);
    const after = refuseTask(before, registry, target);

    expect(after.tasks.find((t) => t.uid === target)).toBeUndefined();
    expect(after.tasks).toHaveLength(before.tasks.length - 1);
  });

  /** The only one of the three anybody outside the conversation hears about. */
  it('is the only one that costs standing', () => {
    const before = game();
    const refused = refuseTask(before, registry, uid(before));
    expect(refused.stats.reputation).toBe(before.stats.reputation - REFUSE_REPUTATION_COST);

    const extended = extendDeadline(before, registry, uid(before));
    const scoped = scopeDown(before, registry, uid(before));
    expect(extended.stats.reputation).toBe(before.stats.reputation);
    expect(scoped.stats.reputation).toBe(before.stats.reputation);
  });

  it('says so in the month log', () => {
    const after = refuseTask(game(), registry, uid(game()));
    expect(after.log.at(-1)?.messageKey).toBe('log.refused_file');
  });

  it('is refused when the favours are not there', () => {
    const broke = game(2);
    expect(refuseTask(broke, registry, uid(broke))).toBe(broke);
  });
});
