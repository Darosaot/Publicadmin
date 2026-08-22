import { describe, expect, it } from 'vitest';
import { createGame } from '../../src/engine/newGame';
import {
  canTakePerk,
  hasPerk,
  perkBlocker,
  perkCost,
  perkFlag,
  perkPointsAvailable,
  perkPointsEarned,
  perkPointsSpent,
  takePerk,
  takenPerks,
  PERK_POINT_MONTHS,
} from '../../src/engine/perks';
import type { GameState } from '../../src/engine/types';
import { makeQuietRegistry } from './fixtures';

const registry = makeQuietRegistry();

function game(over: Partial<GameState> = {}): GameState {
  return { ...createGame({ name: 'Test', department: 'legal', seed: 5 }, registry), ...over };
}

/** Enough months and rank that points are never the thing under test. */
function rich(): GameState {
  const base = game({ calendarMonth: 240 });
  return { ...base, player: { ...base.player, level: 4 } };
}

describe('earning points', () => {
  it('starts a career with none', () => {
    expect(perkPointsEarned(game())).toBe(0);
  });

  it('pays one for every three years served', () => {
    expect(perkPointsEarned(game({ calendarMonth: PERK_POINT_MONTHS - 1 }))).toBe(0);
    expect(perkPointsEarned(game({ calendarMonth: PERK_POINT_MONTHS }))).toBe(1);
    expect(perkPointsEarned(game({ calendarMonth: PERK_POINT_MONTHS * 4 }))).toBe(4);
  });

  it('pays one for every promotion as well', () => {
    const base = game({ calendarMonth: 0 });
    const senior = { ...base, player: { ...base.player, level: 4 } };
    expect(perkPointsEarned(senior)).toBe(3);
  });

  /**
   * The reason points are derived rather than stored: there is no balance to corrupt, so no code
   * path can leak or double-spend one. Spending is a sum over what has actually been taken.
   */
  it('spends by summing what has been taken, not by decrementing a counter', () => {
    let state = rich();
    expect(perkPointsSpent(state, registry)).toBe(0);

    state = takePerk(state, registry, 'root');
    expect(perkPointsSpent(state, registry)).toBe(1);

    state = takePerk(state, registry, 'child');
    expect(perkPointsSpent(state, registry)).toBe(1 + 2);
    expect(perkPointsAvailable(state, registry)).toBe(perkPointsEarned(state) - 3);
  });
});

describe('taking a perk', () => {
  it('writes a flag and nothing else', () => {
    const before = rich();
    const after = takePerk(before, registry, 'root');

    expect(hasPerk(after, 'root')).toBe(true);
    expect(after.flags[perkFlag('root')]).toBe(1);
    // Flags are the whole storage story — no new state field, and so no migration.
    expect({ ...after, flags: before.flags }).toEqual(before);
  });

  it('costs its own tier, so the deep ones are expensive by construction', () => {
    const root = registry.perks.find((p) => p.id === 'root')!;
    const capstone = registry.perks.find((p) => p.id === 'capstone')!;
    expect(perkCost(root)).toBe(1);
    expect(perkCost(capstone)).toBe(4);
  });

  it('refuses one whose parent has not been taken', () => {
    const state = rich();
    expect(perkBlocker(state, registry, 'child')).toBe('requires');
    expect(takePerk(state, registry, 'child')).toBe(state);
  });

  it('allows it once the parent is in hand', () => {
    const state = takePerk(rich(), registry, 'root');
    expect(canTakePerk(state, registry, 'child')).toBe(true);
  });

  it('refuses a capstone at a junior desk however many points are saved', () => {
    const junior = game({ calendarMonth: 600 });
    expect(perkPointsAvailable(junior, registry)).toBeGreaterThan(4);
    expect(perkBlocker(junior, registry, 'capstone')).toBe('level');
  });

  it('refuses one that cannot be afforded', () => {
    const base = game({ calendarMonth: 0 });
    const senior = { ...base, player: { ...base.player, level: 4 } };
    // Three points earned; the capstone costs four.
    expect(perkPointsAvailable(senior, registry)).toBe(3);
    expect(perkBlocker(senior, registry, 'capstone')).toBe('points');
  });

  it('will not sell the same perk twice', () => {
    const state = takePerk(rich(), registry, 'root');
    expect(perkBlocker(state, registry, 'root')).toBe('taken');
    const again = takePerk(state, registry, 'root');
    expect(perkPointsSpent(again, registry)).toBe(1);
  });

  it('lists what has been taken', () => {
    let state = takePerk(rich(), registry, 'root');
    state = takePerk(state, registry, 'child');
    expect(takenPerks(state, registry).map((p) => p.id)).toEqual(['root', 'child']);
  });
});
