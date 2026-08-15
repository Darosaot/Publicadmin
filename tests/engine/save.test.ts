import { describe, expect, it } from 'vitest';
import { SAVE_VERSION } from '../../src/engine/constants';
import { createGame } from '../../src/engine/newGame';
import { deserialize, serialize } from '../../src/engine/save';
import { beginNextTurn, emptyAllocation, resolveTurn } from '../../src/engine/turn';
import type { GameState } from '../../src/engine/types';
import { registry as realRegistry } from '../../src/content';
import { makeQuietRegistry, makeTestRegistry } from './fixtures';

const registry = makeQuietRegistry();

function game(seed = 6): GameState {
  return createGame({ name: 'Renata Vos', department: 'procurement', seed }, registry);
}

function reload(state: GameState, into = registry): GameState {
  const result = deserialize(serialize(state), into);
  if (!result.ok) throw new Error(`expected a valid save, got ${result.reason}`);
  return result.state;
}

describe('round trip', () => {
  it('restores a game exactly', () => {
    const state = game();
    expect(reload(state)).toEqual(state);
  });

  it('survives a few played months', () => {
    let state = game();
    for (let i = 0; i < 4; i += 1) {
      state = resolveTurn(state, registry, emptyAllocation());
      state = beginNextTurn(state, registry);
    }
    expect(reload(state)).toEqual(state);
  });

  it('resumes the same random stream, so the future is unchanged', () => {
    let original = game(77);
    original = resolveTurn(original, registry, emptyAllocation());
    original = beginNextTurn(original, registry);

    const resumed = reload(original);

    const continuedOriginal = resolveTurn(original, registry, emptyAllocation());
    const continuedResumed = resolveTurn(resumed, registry, emptyAllocation());

    expect(continuedResumed).toEqual(continuedOriginal);
  });
});

describe('rejecting bad saves', () => {
  it('reports an empty slot', () => {
    expect(deserialize(null, registry)).toEqual({ ok: false, reason: 'empty' });
    expect(deserialize('', registry)).toEqual({ ok: false, reason: 'empty' });
  });

  it('reports unparseable data', () => {
    expect(deserialize('{not json', registry)).toEqual({ ok: false, reason: 'corrupt' });
    expect(deserialize('"a string"', registry)).toEqual({ ok: false, reason: 'corrupt' });
    expect(deserialize('null', registry)).toEqual({ ok: false, reason: 'corrupt' });
  });

  it('reports a save with no version stamp', () => {
    expect(deserialize(JSON.stringify({ turn: 3 }), registry)).toEqual({
      ok: false,
      reason: 'corrupt',
    });
  });

  it('reports a save from a future version rather than guessing', () => {
    const future = { ...game(), saveVersion: SAVE_VERSION + 5 };
    expect(deserialize(JSON.stringify(future), registry)).toEqual({
      ok: false,
      reason: 'incompatible',
    });
  });

  it('reports a save from a version with no migration path', () => {
    const ancient = { ...game(), saveVersion: 0 };
    expect(deserialize(JSON.stringify(ancient), registry)).toEqual({
      ok: false,
      reason: 'incompatible',
    });
  });
});

describe('migrating a save forward', () => {
  // These exercise the shipped post ids the migrations name, so they run against the real
  // registry rather than the fixtures.
  const shipped = realRegistry;

  /**
   * A save as version 1 wrote them: a turn was a month, so there was no separate calendar, and
   * the career was a numbered ladder rather than a graph.
   */
  function version1(state: GameState): string {
    const { calendarMonth: _dropped, ...rest } = state;
    const { postId: _p, track: _t, ...player } = state.player;
    return JSON.stringify({ ...rest, player, saveVersion: 1 });
  }

  /** Version 2 had the calendar but still had a ladder. */
  function version2(state: GameState, level: number): string {
    const { postId: _p, track: _t, ...player } = state.player;
    return JSON.stringify({
      ...state,
      player: { ...player, level },
      offers: [{ id: 'o', toLevel: level + 1, salary: 4000, createdTurn: 1, expiresTurn: 4 }],
      saveVersion: 2,
    });
  }

  it('carries a version 1 career across the clock change instead of rejecting it', () => {
    const state = { ...game(), turn: 17, calendarMonth: 17 };
    const result = deserialize(version1(state), shipped);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.saveVersion).toBe(SAVE_VERSION);
    // Under the old clock a turn *was* a month, so the elapsed months are the turn count. A
    // career saved back then really had been running seventeen months, not seventeen quarters.
    expect(result.state.calendarMonth).toBe(17);
    expect(result.state.player.name).toBe('Renata Vos');
  });

  it('puts a version 2 career on the line track it was already climbing', () => {
    const result = deserialize(version2({ ...game(), turn: 30 }, 3), shipped);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.player.postId).toBe('post.region.head_of_unit');
    expect(result.state.player.track).toBe('line');
    expect(result.state.player.level).toBe(3);
  });

  it('remaps an offer that was in flight when the ladder became a tree', () => {
    const result = deserialize(version2({ ...game(), turn: 30 }, 3), shipped);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const offer = result.state.offers[0];
    expect(offer?.toPost).toBe('post.agency.head_of_department');
    expect(offer?.toTier).toBe(4);
    expect(offer).not.toHaveProperty('toLevel');
  });

  /** Version 3 had the tree, but counted the budget year in turns. */
  function version3(state: GameState): string {
    return JSON.stringify({
      ...state,
      budget: { monthly: 11500, balance: -900, yearStartTurn: 4, spentThisMonth: 0 },
      saveVersion: 3,
    });
  }

  it('restarts the budget year of a version 3 career rather than guessing at it', () => {
    const result = deserialize(version3({ ...game(), turn: 20, calendarMonth: 44 }), shipped);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // The old save never recorded which month the year began, so it cannot be recovered. Starting
    // it again now costs the player at most one verdict and can never hand them a spurious one.
    expect(result.state.budget?.yearStartMonth).toBe(44);
    expect(result.state.budget).not.toHaveProperty('yearStartTurn');
    // Everything else about the budget survives untouched.
    expect(result.state.budget?.balance).toBe(-900);
    expect(result.state.budget?.monthly).toBe(11500);
  });

  it('migrates a version 3 career that never had a unit', () => {
    const { budget: _none, ...noUnit } = game();
    const raw = JSON.stringify({ ...noUnit, saveVersion: 3 });

    const result = deserialize(raw, shipped);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.budget).toBeUndefined();
  });

  it('leaves the migrated career playable', () => {
    const result = deserialize(version1(game()), shipped);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // Resolving a cycle against the real content is the actual test: it exercises the post
    // lookups the migration had to get right, any one of which would throw on a bad id. The
    // board comes back empty because these fixtures' task ids are pruned against real content,
    // which is the pruning working rather than a problem.
    const played = resolveTurn(result.state, shipped, emptyAllocation());
    expect(played.phase).not.toBe('allocation');
    expect(played.player.postId).toBe('post.alderford.officer');
    expect(played.stats.stress).toBeGreaterThan(result.state.stats.stress);
  });

  it('repairs a save whose post no longer exists rather than refusing it', () => {
    // Content moves on. Losing your post is a bad outcome; a save that cannot be opened at all
    // is a worse one, so an unknown post falls back to where careers start.
    const orphaned = { ...game(), player: { ...game().player, postId: 'post.deleted' } };
    const result = deserialize(JSON.stringify(orphaned), registry);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.player.postId).toBe('post.test.junior');
    expect(result.state.player.level).toBe(1);
  });

  it('reports a save missing the fields the engine relies on', () => {
    const truncated = { saveVersion: SAVE_VERSION, turn: 4 };
    expect(deserialize(JSON.stringify(truncated), registry)).toEqual({
      ok: false,
      reason: 'corrupt',
    });
  });
});

describe('content that has since been removed', () => {
  it('drops tasks, queued events and scheduled events that no longer exist', () => {
    const state: GameState = {
      ...game(),
      pendingEvents: [{ eventId: 'evt.test.common' }, { eventId: 'evt.gone' }],
      scheduledEvents: [
        { eventId: 'evt.test.followup', onTurn: 9 },
        { eventId: 'evt.also.gone', onTurn: 9 },
      ],
    };
    state.tasks = [
      ...state.tasks,
      { ...state.tasks[0]!, uid: 'ghost', templateId: 'task.retired' },
    ];

    const restored = reload(state, makeTestRegistry());

    expect(restored.tasks.some((t) => t.templateId === 'task.retired')).toBe(false);
    expect(restored.pendingEvents.map((p) => p.eventId)).toEqual(['evt.test.common']);
    expect(restored.scheduledEvents.map((s) => s.eventId)).toEqual(['evt.test.followup']);
  });

  it('leaves a still-playable game behind after pruning', () => {
    const state: GameState = { ...game(), pendingEvents: [{ eventId: 'evt.gone' }] };
    const restored = reload(state, makeTestRegistry());
    expect(restored.tasks.length).toBeGreaterThan(0);
    expect(restored.player.name).toBe('Renata Vos');
  });
});
