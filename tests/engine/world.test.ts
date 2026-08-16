import { describe, expect, it } from 'vitest';
import { createGame } from '../../src/engine/newGame';
import { applyEffects } from '../../src/engine/effects';
import { beginNextTurn, emptyAllocation, resolveTurn } from '../../src/engine/turn';
import {
  bodyCondition,
  bodyKnown,
  bodyStanding,
  conditionFlag,
  contributionTo,
  driftWorld,
  knownBodies,
  knownFlag,
  standingFlag,
} from '../../src/engine/world';
import { doneFlag, startInitiative } from '../../src/engine/initiatives';
import type { GameState } from '../../src/engine/types';
import { DRIFT_FLOOR } from '../../src/engine/constants';
import { makeQuietRegistry } from './fixtures';

const registry = makeQuietRegistry();
const sinking = registry.bodies.find((b) => b.id === 'sinking')!;
const rising = registry.bodies.find((b) => b.id === 'rising')!;
const steady = registry.bodies.find((b) => b.id === 'steady')!;

function game(): GameState {
  return createGame({ name: 'Test', department: 'finance', seed: 7 }, registry);
}

describe('reading a body', () => {
  /**
   * The reason the country needed no save migration: a career that predates it reads every place
   * as exactly what the content says it was founded at.
   */
  it('reads as its founding condition when nobody has touched it', () => {
    const state = game();
    expect(state.flags[conditionFlag(sinking.id)]).toBeUndefined();
    expect(bodyCondition(state, sinking)).toBe(sinking.baselineCondition);
    expect(bodyStanding(state, sinking)).toBe(0);
    expect(bodyKnown(state, sinking)).toBe(false);
  });

  it('adds what has been done to it', () => {
    const state = applyEffects(
      game(),
      [{ kind: 'flagDelta', flag: conditionFlag(rising.id), delta: 12 }],
      registry,
    );
    expect(bodyCondition(state, rising)).toBe(rising.baselineCondition + 12);
  });

  it('keeps a condition inside 0 and 100 however far it is pushed', () => {
    const wrecked = applyEffects(
      game(),
      [{ kind: 'flagDelta', flag: conditionFlag(rising.id), delta: -500 }],
      registry,
    );
    const perfected = applyEffects(
      game(),
      [{ kind: 'flagDelta', flag: conditionFlag(rising.id), delta: 500 }],
      registry,
    );

    expect(bodyCondition(wrecked, rising)).toBe(0);
    expect(bodyCondition(perfected, rising)).toBe(100);
  });
});

describe('drift', () => {
  it('moves places in the direction their content says, and leaves still ones alone', () => {
    const after = driftWorld(game(), registry, 12);

    expect(bodyCondition(after, sinking)).toBeLessThan(sinking.baselineCondition);
    expect(bodyCondition(after, rising)).toBeGreaterThan(rising.baselineCondition);
    expect(after.flags[conditionFlag(steady.id)]).toBeUndefined();
  });

  it('moves by the months given, not by the number of calls', () => {
    const once = driftWorld(game(), registry, 12);
    const twice = driftWorld(driftWorld(game(), registry, 6), registry, 6);

    expect(bodyCondition(once, sinking)).toBeCloseTo(bodyCondition(twice, sinking), 6);
  });

  it('does nothing for a cycle that covered no time', () => {
    expect(driftWorld(game(), registry, 0).flags).toEqual(game().flags);
  });

  /**
   * Deliberately not random. Two careers on the same seed have to be comparable, which is the
   * entire basis of the balance harness.
   */
  it('is deterministic', () => {
    expect(driftWorld(game(), registry, 9).flags).toEqual(driftWorld(game(), registry, 9).flags);
  });

  /**
   * This used to assert a neglected body bottomed out at zero. It did, and that was the bug: at
   * -0.09 a month the district council in the shipped content fell from 34 to 4 across a career,
   * so no amount of player work could ever show against it. Decay now decelerates toward
   * `DRIFT_FLOOR` — not mean reversion, which would make the player's own gains fade too, but the
   * observation that a place with almost nothing left has almost nothing left to lose.
   */
  it('lets neglect ruin a place but not annihilate it', () => {
    const after = driftWorld(game(), registry, 10_000);
    const settled = bodyCondition(after, sinking);

    expect(settled).toBeGreaterThan(DRIFT_FLOOR - 1);
    expect(settled).toBeLessThan(DRIFT_FLOOR + 1);
    // And it is still a wreck: nothing here pulls it back toward where it started.
    expect(settled).toBeLessThan(sinking.baselineCondition);
  });

  it('does not slow a place that somebody else is improving', () => {
    // Deceleration is about having less left to lose. A body drifting upward is one being worked
    // on, and there is no reason for that to tail off as it gets better.
    const after = driftWorld(game(), registry, 40);
    expect(bodyCondition(after, rising)).toBeCloseTo(rising.baselineCondition + 0.25 * 40, 5);
  });

  /**
   * The player's mark is permanent. An earlier draft pulled every body back toward its baseline,
   * which simulates entropy nicely and plays terribly — a mark that fades is a mark you did not
   * make. Places get worse on their own; they get better only because somebody did something.
   */
  it('never erodes what the player did', () => {
    const fixed = applyEffects(
      game(),
      [{ kind: 'flagDelta', flag: conditionFlag(steady.id), delta: 20 }],
      registry,
    );
    const muchLater = driftWorld(fixed, registry, 360);

    expect(bodyCondition(muchLater, steady)).toBe(steady.baselineCondition + 20);
  });
});

describe('the country moves while you work', () => {
  it('drifts by the length of the cycle just worked', () => {
    const start = game();
    const played = beginNextTurn(
      resolveTurn(start, registry, emptyAllocation()),
      registry,
    );

    expect(played.calendarMonth).toBeGreaterThan(start.calendarMonth);
    expect(bodyCondition(played, sinking)).toBeLessThan(sinking.baselineCondition);
  });
});

describe('the places you already deal with', () => {
  it('knows the bodies on your own beat from the first month', () => {
    // The fixture puts `rising` on finance's beat and the other two on legal's.
    const state = game();

    expect(bodyKnown(state, rising)).toBe(true);
    expect(bodyKnown(state, sinking)).toBe(false);
    expect(bodyKnown(state, steady)).toBe(false);
  });

  it('picks up a new beat when the post changes', () => {
    // Moving department is what an offer does; the engine re-checks on every month boundary, so
    // the institutions of the new beat arrive without content having to remember to say so.
    const start = game();
    const moved: GameState = { ...start, player: { ...start.player, department: 'legal' } };
    const played = beginNextTurn(resolveTurn(moved, registry, emptyAllocation()), registry);

    expect(bodyKnown(played, sinking)).toBe(true);
    expect(bodyKnown(played, steady)).toBe(true);
    // And what you already knew, you still know.
    expect(bodyKnown(played, rising)).toBe(true);
  });
});

describe('what the player has looked at', () => {
  it('lists only known bodies, worst first', () => {
    let state = game();
    state = applyEffects(
      state,
      [
        { kind: 'flag', flag: knownFlag(rising.id) },
        { kind: 'flag', flag: knownFlag(sinking.id) },
        { kind: 'flagDelta', flag: standingFlag(sinking.id), delta: 30 },
      ],
      registry,
    );

    const seen = knownBodies(state, registry);

    expect(seen.map((b) => b.id)).toEqual(['sinking', 'rising']);
    expect(bodyStanding(state, sinking)).toBe(30);
  });
});

/**
 * The epilogue's "places you changed" list was built on net movement and so listed eight
 * institutions for a career that had touched two — six of them pure drift, reported as places the
 * player had left worse than they found them. These are the tests that make that impossible: what
 * the player did and what happened anyway are separate numbers, and only the first is theirs.
 */
describe('what the player can be credited with', () => {
  it('credits nobody for drift, however far a place has fallen', () => {
    let state = game();
    for (let month = 0; month < 240; month += 1) state = driftWorld(state, registry, 1);

    // The place is visibly worse than it was founded...
    expect(bodyCondition(state, sinking)).toBeLessThan(sinking.baselineCondition);
    // ...and none of that is anybody's doing.
    expect(contributionTo(state, registry, sinking.id)).toBe(0);
  });

  it('counts what a finished initiative paid into a place, and nothing else', () => {
    const state = applyEffects(game(), [{ kind: 'flag', flag: doneFlag('init.cheap') }], registry);

    expect(contributionTo(state, registry, sinking.id)).toBe(6);
    // `init.cheap` also sets `cheap_done` and pays nothing to anywhere else.
    expect(contributionTo(state, registry, rising.id)).toBe(0);
  });

  it('ignores an initiative that is merely under way', () => {
    const state = game();
    const started = startInitiative(state, registry, 'init.cheap');

    expect(started.initiatives).toHaveLength(1);
    expect(contributionTo(started, registry, sinking.id)).toBe(0);
  });

  /**
   * The honest and most common outcome of one career against thirty years of neglect: the work
   * landed, and the place still ended lower than it started. The epilogue needs both halves to
   * say so — a positive contribution against a negative net.
   */
  it('stays positive on a rescue that landed while the place still ended down', () => {
    let state = applyEffects(game(), [{ kind: 'flag', flag: doneFlag('init.cheap') }], registry);
    state = applyEffects(
      state,
      [{ kind: 'flagDelta', flag: conditionFlag(sinking.id), delta: 6 }],
      registry,
    );
    for (let month = 0; month < 120; month += 1) state = driftWorld(state, registry, 1);

    expect(contributionTo(state, registry, sinking.id)).toBeGreaterThan(0);
    expect(bodyCondition(state, sinking)).toBeLessThan(sinking.baselineCondition);
  });
});
