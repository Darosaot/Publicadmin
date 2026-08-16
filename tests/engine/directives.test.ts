/**
 * Standing directives.
 *
 * The thing worth testing is not that a flag can be written — it is that each directive actually
 * reaches the mechanic it claims to, and that its two poles are genuinely opposite. A directive
 * whose "cost" side is also a benefit would read as a choice and be a free bonus, and nothing in
 * the type system would notice.
 */

import { describe, expect, it } from 'vitest';
import {
  directiveFlag,
  hiringMoraleDelta,
  hiringSkillDelta,
  hoursMoraleDelta,
  hoursStressDelta,
  rigourEffortDelta,
  rigourQualityDelta,
  stanceOf,
} from '../../src/engine/directives';
import { createGame } from '../../src/engine/newGame';
import { createStaff } from '../../src/engine/team';
import { refillBoard } from '../../src/engine/tasks';
import { emptyAllocation, resolveTurn } from '../../src/engine/turn';
import type { GameState } from '../../src/engine/types';
import { makeQuietRegistry } from './fixtures';

const registry = makeQuietRegistry();

function game(): GameState {
  return createGame({ name: 'Test', department: 'finance', seed: 5 }, registry);
}

function withStance(id: string, stance: 0 | 1 | 2): GameState {
  const start = game();
  return { ...start, flags: { ...start.flags, [directiveFlag(id)]: stance } };
}

/**
 * The same, with somebody reporting to you.
 *
 * The pressure directive is inert without a unit — you cannot absorb your people's load when you
 * have no people — so every assertion about it has to be made against a manager.
 */
function managing(id: string, stance: 0 | 1 | 2): GameState {
  const base = withStance(id, stance);
  const hired = createStaff(base, registry, 'officer');
  return { ...hired.state, staff: [hired.staff] };
}

describe('reading a stance', () => {
  it('is inert until there is a unit for it to land on', () => {
    // The trade is between your load and theirs. Before the first management post there is no
    // "theirs", so answering the question early must not quietly cost anything.
    expect(hoursStressDelta(withStance('hours', 1))).toBe(0);
    expect(hoursMoraleDelta(withStance('hours', 2))).toBe(0);
    expect(hoursStressDelta(managing('hours', 1))).not.toBe(0);
  });

  it('treats an office that has not decided as the default', () => {
    expect(stanceOf(game(), 'hours')).toBe(0);
    expect(hoursStressDelta(managing('hours', 0))).toBe(0);
    expect(rigourQualityDelta(game())).toBe(0);
    expect(hiringSkillDelta(game())).toBe(0);
  });

  it('ignores a value that is not one of the two poles', () => {
    // Flags are numbers and content could write anything into one. Anything unrecognised has to
    // mean "undecided" rather than crashing or silently acting like a pole.
    expect(stanceOf(withStance('hours', 7 as 0), 'hours')).toBe(0);
  });
});

/**
 * The symmetry check, and the reason `lean` exists in the module rather than three hand-written
 * sign flips: every pole must cost what the other one buys.
 */
describe('the two poles really are opposite', () => {
  it.each([
    ['hours', hoursStressDelta, managing],
    ['hours', hoursMoraleDelta, managing],
    ['rigour', rigourQualityDelta, withStance],
    ['rigour', rigourEffortDelta, withStance],
    ['hiring', hiringSkillDelta, withStance],
    ['hiring', hiringMoraleDelta, withStance],
  ] as const)('%s: one pole is the negative of the other', (id, read, build) => {
    const first = read(build(id, 1));
    const second = read(build(id, 2));

    expect(first).toBe(-second);
    expect(first).not.toBe(0);
  });
});

describe('pressure reaches the month', () => {
  it('changes what a cycle costs you in stress', () => {
    const absorbing = resolveTurn(managing('hours', 1), registry, emptyAllocation());
    const passing = resolveTurn(managing('hours', 2), registry, emptyAllocation());

    expect(passing.stats.stress).toBeLessThan(absorbing.stats.stress);
  });
});

describe('rigour reaches the board', () => {
  it('makes every file cost more, or less, at the moment it lands', () => {
    // Measured on the board a fresh career is dealt, because the cost is priced in at spawn so
    // that it shows on the card rather than arriving as a surprise at the end of the month.
    // The board has to be dealt *after* the stance is set: `createGame` fills it on the way out,
    // so a flag written onto the returned state would arrive one board too late.
    const deal = (stance: 1 | 2) =>
      refillBoard({ ...withStance('rigour', stance), tasks: [] }, registry);
    const careful = deal(1);
    const quick = deal(2);

    const total = (state: GameState) => state.tasks.reduce((sum, t) => sum + t.required, 0);

    expect(total(careful)).toBeGreaterThan(total(quick));
  });
});

describe('hiring reaches the people', () => {
  it('trades ability on arrival against keenness', () => {
    const potential = createStaff(withStance('hiring', 1), registry, 'officer').staff;
    const experience = createStaff(withStance('hiring', 2), registry, 'officer').staff;

    expect(potential.skill).toBeLessThan(experience.skill);
    expect(potential.morale).toBeGreaterThan(experience.morale);
  });
});
