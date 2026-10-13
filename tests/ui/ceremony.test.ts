import { describe, expect, it } from 'vitest';
import { registry } from '../../src/content';
import { createGame } from '../../src/engine/newGame';
import type { GameState, StaffMember, TurnReport } from '../../src/engine/types';
import {
  detectCeremonies,
  LONG_INITIATIVE_CYCLES,
  LONG_SERVICE_TURNS,
} from '../../src/ui/ceremony';

function start(): GameState {
  return createGame({ name: 'Ada Fixture', department: 'procurement', seed: 11 }, registry);
}

function report(over: Partial<TurnReport> = {}): TurnReport {
  return { turn: 5, completed: [], failed: [], statDeltas: {}, salaryDelta: 0, newOffers: [], ...over };
}

function member(over: Partial<StaffMember> = {}): StaffMember {
  return {
    id: 's1',
    name: 'Bo Sample',
    seniority: 'officer',
    skill: 60,
    morale: 60,
    salary: 2600,
    monthsInPost: LONG_SERVICE_TURNS + 4,
    xp: 40,
    specialism: 'procurement',
    ...over,
  };
}

const longInitiative = registry.initiatives.find((i) => i.minCycles >= LONG_INITIATIVE_CYCLES)!;
const shortInitiative = registry.initiatives.find((i) => i.minCycles < LONG_INITIATIVE_CYCLES)!;

describe('which moments get the whole screen', () => {
  it('finds nothing when nothing happened, or when there is nothing to compare', () => {
    const game = start();
    expect(detectCeremonies(game, game, registry)).toEqual([]);
    expect(detectCeremonies(null, game, registry)).toEqual([]);
    expect(detectCeremonies(game, null, registry)).toEqual([]);
  });

  it('crowns a step up the ladder', () => {
    const before = start();
    const post = registry.posts.find((p) => p.tier === 2)!;
    const after: GameState = {
      ...before,
      player: { ...before.player, postId: post.id, level: 2, track: post.track },
    };
    expect(detectCeremonies(before, after, registry)).toEqual([
      { kind: 'promotion', postId: post.id, tier: 2 },
    ]);
  });

  it('does not crown a move to another post at the same tier, or a fall', () => {
    const before = start();
    const second = registry.posts.find((p) => p.tier === 2)!;
    const higher: GameState = {
      ...before,
      player: { ...before.player, postId: second.id, level: 2, track: second.track },
    };
    const sideways: GameState = {
      ...higher,
      player: { ...higher.player, postId: 'another.post.at.tier.two' },
    };
    expect(detectCeremonies(higher, sideways, registry)).toEqual([]);
    expect(detectCeremonies(higher, before, registry)).toEqual([]);
  });

  it('never mistakes a different career for a promotion in this one', () => {
    const before = start();
    const post = registry.posts.find((p) => p.tier === 3)!;
    const other: GameState = {
      ...createGame({ name: 'Someone Else', department: 'legal', seed: 99 }, registry),
      player: {
        ...before.player,
        name: 'Someone Else',
        postId: post.id,
        level: 3,
        track: post.track,
      },
    };
    expect(detectCeremonies(before, other, registry)).toEqual([]);
  });

  it('marks a long initiative landing and leaves a short one in the report', () => {
    const before = start();
    const landed = (id: string): GameState => ({
      ...before,
      lastReport: report({ initiativesCompleted: [id] }),
    });
    expect(detectCeremonies(before, landed(longInitiative.id), registry)).toEqual([
      { kind: 'initiative', templateId: longInitiative.id },
    ]);
    expect(detectCeremonies(before, landed(shortInitiative.id), registry)).toEqual([]);
  });

  it('does not replay a report it has already seen', () => {
    const before: GameState = {
      ...start(),
      lastReport: report({ initiativesCompleted: [longInitiative.id] }),
    };
    expect(detectCeremonies(before, { ...before }, registry)).toEqual([]);
  });

  it('marks the going of someone who served a long time, and only the longest-serving', () => {
    const before: GameState = {
      ...start(),
      staff: [
        member({ id: 'a', name: 'Ana Long', monthsInPost: LONG_SERVICE_TURNS + 20 }),
        member({ id: 'b', name: 'Bo Sample' }),
        member({ id: 'c', name: 'Cy Newish', monthsInPost: 3 }),
      ],
    };
    const after: GameState = {
      ...before,
      staff: [],
      lastReport: report({
        team: {
          delegatedProgress: [],
          arrivals: [],
          departures: [
            { name: 'Bo Sample', reason: 'morale' },
            { name: 'Ana Long', reason: 'promoted_away' },
            { name: 'Cy Newish', reason: 'morale' },
          ],
        },
      }),
    };
    const found = detectCeremonies(before, after, registry);
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ kind: 'farewell', name: 'Ana Long', reason: 'promoted_away' });
  });

  it('lets a newcomer leave without ceremony', () => {
    const before: GameState = { ...start(), staff: [member({ name: 'Cy Newish', monthsInPost: 3 })] };
    const after: GameState = {
      ...before,
      lastReport: report({
        team: {
          delegatedProgress: [],
          arrivals: [],
          departures: [{ name: 'Cy Newish', reason: 'morale' }],
        },
      }),
    };
    expect(detectCeremonies(before, after, registry)).toEqual([]);
  });

  it('opens the ministry, and only the ministry, among the endings', () => {
    const before = start();
    const ended = (ending: GameState['ending']): GameState => ({
      ...before,
      phase: 'ended',
      ending,
    });
    expect(detectCeremonies(before, ended('minister'), registry)).toEqual([{ kind: 'ministry' }]);
    expect(detectCeremonies(before, ended('burnout'), registry)).toEqual([]);
    expect(detectCeremonies(before, ended('retirement_honoured'), registry)).toEqual([]);
    // Already over: coming back to the ending screen is not a second coronation.
    expect(detectCeremonies(ended('minister'), ended('minister'), registry)).toEqual([]);
  });
});
