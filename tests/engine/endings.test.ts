import { describe, expect, it } from 'vitest';
import { DISGRACE_INTEGRITY } from '../../src/engine/constants';
import { checkEnding, isPositiveEnding } from '../../src/engine/endings';
import { createGame } from '../../src/engine/newGame';
import { emptyAllocation, resolveTurn } from '../../src/engine/turn';
import type { GameState, PlayerStats } from '../../src/engine/types';
import { makeQuietRegistry } from './fixtures';

const registry = makeQuietRegistry();

function game(stats: Partial<PlayerStats> = {}, overrides: Partial<GameState> = {}): GameState {
  const base = createGame({ name: 'Test', department: 'finance', seed: 2 }, registry);
  return { ...base, ...overrides, stats: { ...base.stats, ...stats } };
}

describe('checkEnding', () => {
  it('leaves a healthy career running', () => {
    expect(checkEnding(game())).toBeUndefined();
  });

  it('ends in burnout at maximum stress', () => {
    expect(checkEnding(game({ stress: 99 }))).toBeUndefined();
    expect(checkEnding(game({ stress: 100 }))).toBe('burnout');
  });

  it('ends in disgrace when integrity is gone', () => {
    expect(checkEnding(game({ integrity: DISGRACE_INTEGRITY + 1 }))).toBeUndefined();
    expect(checkEnding(game({ integrity: DISGRACE_INTEGRITY }))).toBe('disgrace');
    expect(checkEnding(game({ integrity: 0 }))).toBe('disgrace');
  });

  it('ends in dismissal only when reputation and performance have both collapsed', () => {
    expect(checkEnding(game({ reputation: 5, performance: 60 }))).toBeUndefined();
    expect(checkEnding(game({ reputation: 60, performance: 10 }))).toBeUndefined();
    expect(checkEnding(game({ reputation: 5, performance: 10 }))).toBe('dismissed');
  });

  it('retires the player at the end of the campaign, honourably or quietly', () => {
    expect(checkEnding(game({ reputation: 70 }, { turn: 119 }))).toBeUndefined();
    expect(checkEnding(game({ reputation: 70 }, { turn: 120 }))).toBe('retirement_honoured');
    expect(checkEnding(game({ reputation: 30 }, { turn: 120 }))).toBe('retirement_quiet');
  });

  it('prefers the more specific ending when several apply at once', () => {
    const wrecked = game({ stress: 100, integrity: 0, reputation: 0, performance: 0 });
    expect(checkEnding(wrecked)).toBe('burnout');

    const corrupt = game({ integrity: 0, reputation: 0, performance: 0 });
    expect(checkEnding(corrupt)).toBe('disgrace');
  });

  it('keeps an ending that an event already set', () => {
    expect(checkEnding(game({}, { ending: 'minister' }))).toBe('minister');
  });

  it('knows which endings are worth celebrating', () => {
    expect(isPositiveEnding('minister')).toBe(true);
    expect(isPositiveEnding('retirement_honoured')).toBe(true);
    expect(isPositiveEnding('retirement_quiet')).toBe(false);
    expect(isPositiveEnding('burnout')).toBe(false);
    expect(isPositiveEnding('disgrace')).toBe(false);
    expect(isPositiveEnding('dismissed')).toBe(false);
  });
});

describe('endings inside a real turn', () => {
  it('closes the game at the ending phase when stress runs out', () => {
    const state = game({ stress: 97 }, { turn: 3 });
    const next = resolveTurn(state, registry, { ...emptyAllocation(), overtime: true });

    expect(next.stats.stress).toBe(100);
    expect(next.ending).toBe('burnout');
    expect(next.phase).toBe('ended');
  });

  it('refuses to keep playing once the career has ended', () => {
    const ended = game({}, { ending: 'burnout', phase: 'ended' });
    expect(resolveTurn(ended, registry, emptyAllocation())).toBe(ended);
  });
});
