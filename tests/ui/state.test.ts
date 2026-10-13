import { describe, expect, it } from 'vitest';
import { registry } from '../../src/content';
import { createGame } from '../../src/engine/newGame';
import { serialize } from '../../src/engine/save';
import { gameReducer, initialAppState } from '../../src/state/gameReducer';

describe('importing a save', () => {
  const game = createGame({ name: 'Ada Fixture', department: 'legal', seed: 3 }, registry);

  it('replaces whatever is on screen with the career in the file', () => {
    const next = gameReducer(initialAppState, { type: 'IMPORT_SAVE', json: serialize(game) });
    // Through JSON, as a file would be: `-0` comes back as `0`, which is the same number.
    expect(next.game).toEqual(JSON.parse(serialize(game)));
    expect(next.view).toBe('desk');
    expect(next.notice).toBe('save.import_ok');
  });

  it('leaves the current career alone when the file is not a save', () => {
    const playing = gameReducer(initialAppState, { type: 'NEW_GAME', options: { name: 'Bo', department: 'legal', seed: 4 } });
    const next = gameReducer(playing, { type: 'IMPORT_SAVE', json: '{"nope":true}' });
    expect(next.game).toBe(playing.game);
    expect(next.notice).toBe('save.import_failed');
  });
});
