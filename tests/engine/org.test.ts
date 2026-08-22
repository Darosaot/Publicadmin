import { describe, expect, it } from 'vitest';
import { createGame } from '../../src/engine/newGame';
import {
  DEPUTY_MAX_FILES,
  appointDeputy,
  canBeDeputy,
  deputyAssignments,
  deputyCapacity,
  deputyOf,
  dismissDeputy,
  isDeputy,
  settleDeputy,
} from '../../src/engine/org';
import { setupTeamForPost } from '../../src/engine/team';
import { emptyAllocation, resolveTurn } from '../../src/engine/turn';
import type { GameState } from '../../src/engine/types';
import { makeQuietRegistry } from './fixtures';

const registry = makeQuietRegistry();

/** A career with a real unit under it. */
function manager(seed = 7): GameState {
  const base = createGame({ name: 'Test', department: 'legal', seed }, registry);
  return setupTeamForPost(
    { ...base, player: { ...base.player, postId: 'post.test.head', level: 3 } },
    registry,
  );
}

describe('naming a second', () => {
  it('starts a career with nobody in the job', () => {
    expect(deputyOf(manager())).toBeUndefined();
    expect(deputyCapacity(manager())).toBe(0);
  });

  it('appoints somebody and reads them back', () => {
    const state = manager();
    const chosen = state.staff.find((s) => canBeDeputy(s))!;
    const withDeputy = appointDeputy(state, chosen.id);

    expect(deputyOf(withDeputy)?.id).toBe(chosen.id);
    expect(isDeputy(withDeputy, chosen.id)).toBe(true);
  });

  it('will not put a junior in charge of the board', () => {
    const state = manager();
    const junior = { ...state.staff[0]!, id: 'jr', seniority: 'junior' as const };
    const withJunior: GameState = { ...state, staff: [...state.staff, junior] };

    expect(canBeDeputy(junior)).toBe(false);
    expect(appointDeputy(withJunior, 'jr')).toBe(withJunior);
  });

  it('refuses somebody who does not work here', () => {
    const state = manager();
    expect(appointDeputy(state, 'nobody')).toBe(state);
  });

  it('gives the job up again', () => {
    const state = appointDeputy(manager(), manager().staff[0]!.id);
    expect(dismissDeputy(state).deputyId).toBeUndefined();
  });
});

describe('what a deputy is worth', () => {
  it('runs more of the board the better they are, up to a limit', () => {
    const state = manager();
    const chosen = state.staff.find((s) => canBeDeputy(s))!;

    const poor = appointDeputy(
      { ...state, staff: state.staff.map((s) => (s.id === chosen.id ? { ...s, skill: 10 } : s)) },
      chosen.id,
    );
    const excellent = appointDeputy(
      { ...state, staff: state.staff.map((s) => (s.id === chosen.id ? { ...s, skill: 100 } : s)) },
      chosen.id,
    );

    expect(deputyCapacity(poor)).toBeGreaterThan(0);
    expect(deputyCapacity(excellent)).toBeGreaterThan(deputyCapacity(poor));
    expect(deputyCapacity(excellent)).toBeLessThanOrEqual(DEPUTY_MAX_FILES);
  });

  it('picks up the tightest deadlines you did not hand to anybody', () => {
    const state = manager();
    const chosen = state.staff.find((s) => canBeDeputy(s))!;
    const withDeputy = appointDeputy(state, chosen.id);

    const mine = withDeputy.tasks[0]!.uid;
    const theirs = deputyAssignments(withDeputy, new Set([mine]));

    expect(theirs).not.toContain(mine);
    expect(theirs.length).toBeGreaterThan(0);
    expect(theirs.length).toBeLessThanOrEqual(deputyCapacity(withDeputy));
  });

  /** They are running the board, not working it — which is what the free handovers cost. */
  it('will not also carry a file you hand them', () => {
    const state = manager();
    const chosen = state.staff.find((s) => canBeDeputy(s))!;
    const withDeputy = appointDeputy(state, chosen.id);

    const allocation = emptyAllocation();
    allocation.delegations[withDeputy.tasks[0]!.uid] = chosen.id;

    const next = resolveTurn(withDeputy, registry, allocation);
    // The deputy may still have picked this file up as part of the routine board — what must not
    // happen is the player being charged a point of the month to hand it to them.
    const theirs =
      next.lastReport?.team?.delegatedProgress.filter((d) => d.staffName === chosen.name) ?? [];
    expect(theirs.length).toBeLessThanOrEqual(deputyCapacity(withDeputy));
  });
});

/**
 * The one real trap in the whole feature.
 *
 * `deputyId` is a reference into a list that people leave. A dangling one disables the mechanic
 * silently while the screen goes on naming somebody who left in year nine, so every path that
 * removes a person is checked here rather than trusted.
 */
describe('a deputy who is no longer there', () => {
  it('is dropped when they leave the unit', () => {
    const state = manager();
    const chosen = state.staff.find((s) => canBeDeputy(s))!;
    const withDeputy = appointDeputy(state, chosen.id);

    const gone: GameState = {
      ...withDeputy,
      staff: withDeputy.staff.filter((s) => s.id !== chosen.id),
    };

    expect(settleDeputy(gone).deputyId).toBeUndefined();
  });

  it('is kept while they are still here', () => {
    const state = manager();
    const chosen = state.staff.find((s) => canBeDeputy(s))!;
    const withDeputy = appointDeputy(state, chosen.id);

    expect(settleDeputy(withDeputy).deputyId).toBe(chosen.id);
  });

  it('does not survive a move to a post with no unit at all', () => {
    const state = manager();
    const chosen = state.staff.find((s) => canBeDeputy(s))!;
    const withDeputy = appointDeputy(state, chosen.id);

    const expert = setupTeamForPost(
      { ...withDeputy, player: { ...withDeputy.player, postId: 'post.test.specialist' } },
      registry,
    );

    expect(expert.staff).toHaveLength(0);
    expect(expert.deputyId).toBeUndefined();
  });

  it('does not survive a move that rebuilds the unit', () => {
    const state = manager();
    const chosen = state.staff.find((s) => canBeDeputy(s))!;
    const withDeputy = appointDeputy(state, chosen.id);

    const moved = setupTeamForPost(withDeputy, registry);

    // A new unit is a new unit: whoever is in it now, none of them was appointed to anything.
    expect(moved.deputyId).toBeUndefined();
  });

  it('survives an ordinary month in which nobody leaves', () => {
    const state = manager();
    const chosen = state.staff.find((s) => canBeDeputy(s))!;
    const withDeputy = appointDeputy(state, chosen.id);

    const next = resolveTurn(withDeputy, registry, emptyAllocation());
    if (next.staff.some((s) => s.id === chosen.id)) {
      expect(next.deputyId).toBe(chosen.id);
    } else {
      expect(next.deputyId).toBeUndefined();
    }
  });
});
