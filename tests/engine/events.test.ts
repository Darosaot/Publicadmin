import { describe, expect, it } from 'vitest';
import {
  applyChoice,
  drawEvents,
  eligibleMilestones,
  eligibleRandomEvents,
  isChoiceAvailable,
  popResolvedEvent,
} from '../../src/engine/events';
import { createGame } from '../../src/engine/newGame';
import { chooseEventOption, continueAfterEvent, emptyAllocation, resolveTurn } from '../../src/engine/turn';
import type { GameState } from '../../src/engine/types';
import { makeTestRegistry, testEvents } from './fixtures';

const registry = makeTestRegistry();

function game(seed = 3, overrides: Partial<GameState> = {}): GameState {
  return { ...createGame({ name: 'Test', department: 'finance', seed }, registry), ...overrides };
}

describe('eligibility', () => {
  it('excludes events whose conditions are not met', () => {
    const junior = game();
    expect(eligibleRandomEvents(junior, registry).map((e) => e.id)).toEqual(['evt.test.common']);

    const senior = game(3, {
      player: { ...game().player, level: 3 },
      stats: { ...game().stats, politicalCapital: 50 },
    });
    expect(eligibleRandomEvents(senior, registry).map((e) => e.id)).toContain('evt.test.gated');
  });

  it('never offers follow-ups to the random pool', () => {
    const ids = eligibleRandomEvents(game(), registry).map((e) => e.id);
    expect(ids).not.toContain('evt.test.followup');
    expect(ids).not.toContain('evt.test.milestone');
  });

  it('respects cooldowns', () => {
    const cooling = game(3, { turn: 4, cooldowns: { 'evt.test.common': 10 } });
    expect(eligibleRandomEvents(cooling, registry)).toHaveLength(0);

    const expired = game(3, { turn: 11, cooldowns: { 'evt.test.common': 10 } });
    expect(eligibleRandomEvents(expired, registry)).toHaveLength(1);
  });

  it('never repeats a milestone', () => {
    const fresh = game(3, { turn: 5 });
    expect(eligibleMilestones(fresh, registry).map((e) => e.id)).toEqual(['evt.test.milestone']);

    const seen = game(3, { turn: 5, firedEvents: ['evt.test.milestone'] });
    expect(eligibleMilestones(seen, registry)).toHaveLength(0);
  });
});

describe('drawEvents', () => {
  it('always delivers scheduled follow-ups that have come due', () => {
    const state = game(3, {
      turn: 6,
      scheduledEvents: [
        { eventId: 'evt.test.followup', onTurn: 6 },
        { eventId: 'evt.test.fatal', onTurn: 9 },
      ],
    });
    const next = drawEvents(state, registry);

    expect(next.pendingEvents.map((p) => p.eventId)).toContain('evt.test.followup');
    expect(next.scheduledEvents).toEqual([{ eventId: 'evt.test.fatal', onTurn: 9 }]);
  });

  it('caps the number of events in a single month', () => {
    const state = game(3, {
      turn: 6,
      scheduledEvents: [
        { eventId: 'evt.test.followup', onTurn: 6 },
        { eventId: 'evt.test.fatal', onTurn: 6 },
        { eventId: 'evt.test.followup', onTurn: 6 },
        { eventId: 'evt.test.fatal', onTurn: 6 },
      ],
    });
    expect(drawEvents(state, registry).pendingEvents.length).toBeLessThanOrEqual(3);
  });

  it('puts drawn random events on cooldown and records them as fired', () => {
    const state = game(3, { turn: 2 });
    const next = drawEvents(state, registry);

    expect(next.firedEvents).toContain('evt.test.common');
    expect(next.cooldowns['evt.test.common']).toBe(2 + 12);
  });

  it('does not put milestones on cooldown — the fired list already stops them', () => {
    const state = game(3, { turn: 5 });
    const next = drawEvents(state, registry);
    expect(next.cooldowns['evt.test.milestone']).toBeUndefined();
    expect(next.firedEvents).toContain('evt.test.milestone');
  });

  it('never draws the same event twice in one month', () => {
    for (let seed = 0; seed < 40; seed += 1) {
      const next = drawEvents(game(seed, { turn: 3 }), registry);
      const ids = next.pendingEvents.map((p) => p.eventId);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('is deterministic for a given cursor', () => {
    expect(drawEvents(game(21, { turn: 3 }), registry)).toEqual(
      drawEvents(game(21, { turn: 3 }), registry),
    );
  });
});

describe('choices', () => {
  it('marks a choice unavailable when its own condition fails', () => {
    const gated = testEvents.find((e) => e.id === 'evt.test.gated')!;
    const [plain, expensive] = gated.choices;

    const poor = game(3, { stats: { ...game().stats, politicalCapital: 10 } });
    expect(isChoiceAvailable(poor, plain!)).toBe(true);
    expect(isChoiceAvailable(poor, expensive!)).toBe(false);

    const rich = game(3, { stats: { ...game().stats, politicalCapital: 95 } });
    expect(isChoiceAvailable(rich, expensive!)).toBe(true);
  });

  it('applies the rolled outcome and records it for display', () => {
    const state = game(3, {
      phase: 'event',
      pendingEvents: [{ eventId: 'evt.test.common' }],
    });
    const next = applyChoice(state, registry, 'evt.test.common', 'safe');

    expect(next.stats.reputation).toBe(state.stats.reputation + 2);
    expect(next.pendingEvents[0]?.resolution).toMatchObject({
      choiceId: 'safe',
      textKey: 'evt.test.common.choice.safe.out.0',
    });
  });

  it('picks between weighted outcomes and reaches both', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 60; seed += 1) {
      const state = game(seed, { phase: 'event', pendingEvents: [{ eventId: 'evt.test.common' }] });
      const next = applyChoice(state, registry, 'evt.test.common', 'risky');
      const key = next.pendingEvents[0]?.resolution?.textKey;
      if (key) seen.add(key);
    }
    expect(seen.size).toBe(2);
  });

  it('refuses a choice the player does not qualify for', () => {
    const state = game(3, {
      phase: 'event',
      pendingEvents: [{ eventId: 'evt.test.gated' }],
      stats: { ...game().stats, politicalCapital: 10 },
    });
    expect(applyChoice(state, registry, 'evt.test.gated', 'expensive')).toBe(state);
  });

  it('ignores a decision on an event that is not at the front of the queue', () => {
    const state = game(3, {
      phase: 'event',
      pendingEvents: [{ eventId: 'evt.test.common' }, { eventId: 'evt.test.followup' }],
    });
    expect(applyChoice(state, registry, 'evt.test.followup', 'accept')).toBe(state);
  });

  it('will not let the same event be decided twice', () => {
    const state = game(3, { phase: 'event', pendingEvents: [{ eventId: 'evt.test.common' }] });
    const once = applyChoice(state, registry, 'evt.test.common', 'safe');
    expect(applyChoice(once, registry, 'evt.test.common', 'safe')).toBe(once);
  });

  it('keeps the outcome visible even when the choice ends the career', () => {
    const state = game(3, { phase: 'event', pendingEvents: [{ eventId: 'evt.test.fatal' }] });
    const next = applyChoice(state, registry, 'evt.test.fatal', 'end');

    expect(next.ending).toBe('minister');
    expect(next.pendingEvents[0]?.resolution?.textKey).toBe('evt.test.fatal.choice.end.out.0');
  });
});

describe('the event queue', () => {
  it('walks through several events and then closes the month', () => {
    const state = game(3, {
      phase: 'event',
      pendingEvents: [{ eventId: 'evt.test.common' }, { eventId: 'evt.test.followup' }],
    });

    let next = chooseEventOption(state, registry, 'evt.test.common', 'safe');
    next = continueAfterEvent(next, registry);
    expect(next.phase).toBe('event');
    expect(next.pendingEvents[0]?.eventId).toBe('evt.test.followup');

    next = chooseEventOption(next, registry, 'evt.test.followup', 'accept');
    next = continueAfterEvent(next, registry);
    expect(next.pendingEvents).toHaveLength(0);
    expect(next.phase).toBe('report');
  });

  it('stops at the ending screen when an event ends the career', () => {
    const state = game(3, { phase: 'event', pendingEvents: [{ eventId: 'evt.test.fatal' }] });
    const decided = chooseEventOption(state, registry, 'evt.test.fatal', 'end');
    expect(continueAfterEvent(decided, registry).phase).toBe('ended');
  });

  it('pops nothing from an empty queue', () => {
    const state = game();
    expect(popResolvedEvent(state)).toBe(state);
  });

  it('reaches the event phase from a normal turn', () => {
    const state = game(5);
    const next = resolveTurn(state, registry, emptyAllocation());
    expect(next.phase).toBe('event');
    expect(next.pendingEvents.length).toBeGreaterThan(0);
  });
});
