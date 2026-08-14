import { describe, expect, it } from 'vitest';
import { SAVE_VERSION } from '../../src/engine/constants';
import { createGame } from '../../src/engine/newGame';
import { deserialize, serialize } from '../../src/engine/save';
import { beginNextTurn, emptyAllocation, resolveTurn } from '../../src/engine/turn';
import type { GameState } from '../../src/engine/types';
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
