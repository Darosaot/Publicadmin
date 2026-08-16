/**
 * Initiatives — the one verb the player owns.
 *
 * Most of these assertions exist because the mechanic's failure modes are quiet rather than loud.
 * An initiative that never accumulates progress, a cycle cap that does not bite, an allocation
 * field the normalizer forgets to fill: none of them throw, and all of them turn the feature into
 * an expensive no-op. So the tests are written against the observable outcome — did the progress
 * move, did the payoff fire — rather than against the shape of the objects in between.
 */

import { describe, expect, it } from 'vitest';
import { INITIATIVE_LAPSE_CYCLES } from '../../src/engine/constants';
import {
  applyInitiativeAssignments,
  canStart,
  cycleCap,
  doneFlag,
  initiativeSlots,
  lapseAllInitiatives,
  lapsedFlag,
  resolveInitiatives,
  startInitiative,
  startableInitiatives,
} from '../../src/engine/initiatives';
import { createGame } from '../../src/engine/newGame';
import { createStaff } from '../../src/engine/team';
import { emptyAllocation, normalizeAllocation, resolveTurn } from '../../src/engine/turn';
import type { Allocation, GameState, InitiativeTemplate } from '../../src/engine/types';
import { makeQuietRegistry } from './fixtures';

const registry = makeQuietRegistry();

const cheap = registry.initiatives.find((t) => t.id === 'init.cheap')!;
const gated = registry.initiatives.find((t) => t.id === 'init.gated')!;
const capped = registry.initiatives.find((t) => t.id === 'init.capped')!;

function game(seed = 12): GameState {
  return createGame({ name: 'Test', department: 'finance', seed }, registry);
}

function allocate(overrides: Partial<Allocation> = {}): Allocation {
  return { ...emptyAllocation(), ...overrides };
}

/** Runs one initiative cycle with the given points put in, and hands back both halves. */
function cycle(state: GameState, effort: Record<string, number>) {
  return resolveInitiatives(state, registry, allocate({ initiativeEffort: effort }));
}

describe('starting one', () => {
  it('records it at zero progress, against the template as it stands today', () => {
    const started = startInitiative(game(), registry, cheap.id);
    const live = started.initiatives[0];

    expect(started.initiatives).toHaveLength(1);
    expect(live?.templateId).toBe(cheap.id);
    expect(live?.progress).toBe(0);
    // Copied onto the record rather than read back from content, so retuning a template does not
    // silently move the goalposts on a career already half-way through it.
    expect(live?.required).toBe(cheap.required);
    expect(live?.idleCycles).toBe(0);
  });

  it('refuses one the career cannot reach yet, and offers it once it can', () => {
    const junior = game();
    expect(canStart(junior, gated)).toBe(false);
    expect(startInitiative(junior, registry, gated.id)).toBe(junior);

    const senior: GameState = { ...junior, player: { ...junior.player, level: 3 } };
    expect(canStart(senior, gated)).toBe(true);
  });

  it('refuses an id that is not in the content at all', () => {
    const start = game();
    expect(startInitiative(start, registry, 'init.nonexistent')).toBe(start);
  });

  it('holds one slot below tier 3 and two at it', () => {
    const junior = game();
    expect(initiativeSlots(junior)).toBe(1);

    const withOne = startInitiative(junior, registry, cheap.id);
    expect(startableInitiatives(withOne, registry)).toHaveLength(0);

    const senior: GameState = { ...withOne, player: { ...withOne.player, level: 3 } };
    expect(initiativeSlots(senior)).toBe(2);
    expect(startableInitiatives(senior, registry).length).toBeGreaterThan(0);
  });

  it('never offers the same undertaking twice', () => {
    const done: GameState = { ...game(), flags: { [doneFlag(cheap.id)]: true } };
    expect(canStart(done, cheap)).toBe(false);
  });

  /**
   * Dropping something is not the same as it being impossible. A lapsed initiative returns to the
   * menu, and content can tell the difference through `init.lapsed.<id>`.
   */
  it('offers a lapsed one again', () => {
    const dropped: GameState = { ...game(), flags: { [lapsedFlag(cheap.id)]: true } };
    expect(canStart(dropped, cheap)).toBe(true);
  });
});

describe('the cycle', () => {
  it('accumulates effort and fires the payoff when it lands', () => {
    let state = startInitiative(game(), registry, cheap.id);

    const first = cycle(state, { [cheap.id]: 4 });
    state = first.state;
    expect(state.initiatives[0]?.progress).toBe(4);
    expect(first.completed).toEqual([]);

    const second = cycle(state, { [cheap.id]: 6 });
    expect(second.completed).toEqual([cheap.id]);
    expect(second.state.initiatives).toHaveLength(0);
    expect(second.state.flags[doneFlag(cheap.id)]).toBe(true);
    // The payoff is handed back rather than applied, so the turn can put it through the one
    // `applyEffects` call every other consequence goes through.
    expect(second.effects).toEqual(cheap.onComplete);
  });

  /**
   * The rule that stops an initiative being a way to bank one quiet month into a payoff.
   * `init.capped` needs 12 over at least 6 cycles, so 2 is all a cycle may absorb.
   */
  it('caps what one cycle can absorb, however much is offered', () => {
    expect(cycleCap(capped)).toBe(2);

    const state = startInitiative(game(), registry, capped.id);
    const flush = cycle(state, { [capped.id]: 99 });

    expect(flush.state.initiatives[0]?.progress).toBe(2);
    expect(flush.completed).toEqual([]);
  });

  it('collapses after enough idle cycles, and the progress is forfeit', () => {
    let state = startInitiative(game(), registry, cheap.id);
    state = cycle(state, { [cheap.id]: 4 }).state;
    expect(state.initiatives[0]?.progress).toBe(4);

    let result = cycle(state, {});
    for (let i = 1; i < INITIATIVE_LAPSE_CYCLES; i += 1) {
      expect(result.lapsed).toEqual([]);
      result = cycle(result.state, {});
    }

    expect(result.lapsed).toEqual([cheap.id]);
    expect(result.state.initiatives).toHaveLength(0);
    expect(result.state.flags[lapsedFlag(cheap.id)]).toBe(true);
    expect(result.state.flags[doneFlag(cheap.id)]).toBeUndefined();
    expect(result.effects).toEqual(cheap.onLapse);
  });

  it('resets the idle count the moment anything is put in', () => {
    let state = startInitiative(game(), registry, cheap.id);
    state = cycle(state, {}).state;
    state = cycle(state, {}).state;
    expect(state.initiatives[0]?.idleCycles).toBe(2);

    state = cycle(state, { [cheap.id]: 1 }).state;
    expect(state.initiatives[0]?.idleCycles).toBe(0);
  });
});

describe('handing one to somebody', () => {
  function managed(): { state: GameState; staffId: string } {
    // `createStaff` mints a person but leaves it to the caller to put them on the roster, the
    // same way `setupTeamForPost` does.
    const hired = createStaff(game(), registry, 'senior');
    const withRoster: GameState = { ...hired.state, staff: [hired.staff] };
    return { state: startInitiative(withRoster, registry, cheap.id), staffId: hired.staff.id };
  }

  it('lets a delegate move it with no effort of your own', () => {
    const { state, staffId } = managed();
    const assigned = applyInitiativeAssignments(
      state,
      allocate({ initiativeDelegations: { [cheap.id]: staffId } }),
    );
    expect(assigned.initiatives[0]?.assignedTo).toBe(staffId);

    const result = resolveInitiatives(assigned, registry, allocate());
    expect(result.state.initiatives[0]?.progress).toBeGreaterThan(0);
  });

  /**
   * The same rule the board follows: a person has one month whatever they are holding. Without
   * this, giving somebody a file *and* an initiative pays their whole output to each.
   */
  it('splits their month across everything they are holding', () => {
    const { state, staffId } = managed();

    const initiativeOnly = resolveInitiatives(
      applyInitiativeAssignments(
        state,
        allocate({ initiativeDelegations: { [cheap.id]: staffId } }),
      ),
      registry,
      allocate(),
    );

    const alsoAFile: GameState = {
      ...state,
      tasks: state.tasks.map((task, i) => (i === 0 ? { ...task, assignedTo: staffId } : task)),
    };
    const shared = resolveInitiatives(
      applyInitiativeAssignments(
        alsoAFile,
        allocate({ initiativeDelegations: { [cheap.id]: staffId } }),
      ),
      registry,
      allocate(),
    );

    expect(shared.state.initiatives[0]!.progress).toBeLessThan(
      initiativeOnly.state.initiatives[0]!.progress,
    );
  });

  it('forgets last month’s carrier when nobody is named this month', () => {
    const { state, staffId } = managed();
    const assigned = applyInitiativeAssignments(
      state,
      allocate({ initiativeDelegations: { [cheap.id]: staffId } }),
    );

    const cleared = applyInitiativeAssignments(assigned, allocate());
    expect(cleared.initiatives[0]?.assignedTo).toBeUndefined();
  });
});

describe('the allocation channel', () => {
  /**
   * The documented silent failure: `normalizeAllocation` builds its result from an object literal
   * that already satisfies the compiler with `initiativeEffort: {}`. Forget the spend loop and
   * every point the player commits vanishes with no error anywhere.
   */
  it('actually spends the points, rather than returning an empty field', () => {
    const state = startInitiative(game(), registry, cheap.id);
    const normalized = normalizeAllocation(
      state,
      registry,
      allocate({ initiativeEffort: { [cheap.id]: 3 } }),
    );

    expect(normalized.initiativeEffort).toEqual({ [cheap.id]: 3 });
  });

  it('trims to the cycle cap before the board ever sees the points', () => {
    const state = startInitiative(game(), registry, capped.id);
    const normalized = normalizeAllocation(
      state,
      registry,
      allocate({ initiativeEffort: { [capped.id]: 9 } }),
    );

    expect(normalized.initiativeEffort[capped.id]).toBe(cycleCap(capped));
  });

  it('ignores effort aimed at something that was never started', () => {
    const normalized = normalizeAllocation(
      game(),
      registry,
      allocate({ initiativeEffort: { [cheap.id]: 5 } }),
    );

    expect(normalized.initiativeEffort).toEqual({});
  });

  it('runs through a real turn, not only through the helpers', () => {
    const state = startInitiative(game(), registry, cheap.id);
    const played = resolveTurn(state, registry, allocate({ initiativeEffort: { [cheap.id]: 5 } }));

    expect(played.initiatives[0]?.progress).toBe(5);
  });

  it('reports what landed on the turn report', () => {
    let state = startInitiative(game(), registry, cheap.id);
    state = { ...state, initiatives: [{ ...state.initiatives[0]!, progress: 9 }] };

    const played = resolveTurn(state, registry, allocate({ initiativeEffort: { [cheap.id]: 1 } }));
    expect(played.lastReport?.initiativesCompleted).toEqual([cheap.id]);
  });
});

describe('changing post', () => {
  it('ends everything in flight and says so', () => {
    const state = startInitiative(game(), registry, cheap.id);
    const ended = lapseAllInitiatives(state, registry);

    expect(ended.state.initiatives).toHaveLength(0);
    expect(ended.state.flags[lapsedFlag(cheap.id)]).toBe(true);
    expect(ended.effects).toEqual(cheap.onLapse);
    expect(ended.log[0]?.messageKey).toBe('log.initiative_abandoned');
  });

  it('is a no-op when there was nothing to leave behind', () => {
    const start = game();
    expect(lapseAllInitiatives(start, registry).state).toBe(start);
  });
});

describe('content that went away', () => {
  it('drops a record whose template no longer exists, without firing its lapse', () => {
    const state = startInitiative(game(), registry, cheap.id);
    const withoutIt = {
      ...registry,
      initiatives: registry.initiatives.filter(
        (t: InitiativeTemplate) => t.id !== cheap.id,
      ),
    };

    const result = resolveInitiatives(state, withoutIt, allocate());
    expect(result.state.initiatives).toHaveLength(0);
    expect(result.lapsed).toEqual([]);
    expect(result.state.flags[lapsedFlag(cheap.id)]).toBeUndefined();
  });
});
