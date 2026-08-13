import { describe, expect, it } from 'vitest';
import { createGame } from '../../src/engine/newGame';
import { eligibleRandomEvents } from '../../src/engine/events';
import { registry, allEvents, allTasks, EN_STRINGS } from '../../src/content';
import { validateContent } from '../../src/content/validate';
import { translate } from '../../src/i18n';
import { DEPARTMENT_IDS, type DepartmentId } from '../../src/engine/types';

describe('content validation', () => {
  it('has no structural problems', () => {
    expect(validateContent()).toEqual([]);
  });
});

describe('corpus size', () => {
  it('ships enough events that a long career does not repeat itself', () => {
    expect(allEvents.length).toBeGreaterThanOrEqual(80);
  });

  it('ships enough task templates to keep the board varied', () => {
    expect(allTasks.length).toBeGreaterThanOrEqual(40);
  });

  it('covers every kind of event', () => {
    const kinds = new Set(allEvents.map((e) => e.kind));
    expect(kinds).toEqual(new Set(['random', 'milestone', 'followup']));
  });
});

describe('every department is playable', () => {
  const departments = DEPARTMENT_IDS;

  it.each(departments)('%s has work available at level 1', (department: DepartmentId) => {
    const state = createGame({ name: 'Test', department, seed: 5 }, registry);
    expect(state.tasks.length).toBe(3);
  });

  it.each(departments)('%s has random events available at level 1', (department: DepartmentId) => {
    const state = createGame({ name: 'Test', department, seed: 5 }, registry);
    const pool = eligibleRandomEvents(state, registry);
    expect(pool.length).toBeGreaterThan(8);
    expect(pool.some((e) => e.conditions?.departments?.includes(department))).toBe(true);
  });

  it.each(departments)('%s never sees another department’s events', (department: DepartmentId) => {
    const state = createGame({ name: 'Test', department, seed: 5 }, registry);
    for (const event of eligibleRandomEvents(state, registry)) {
      const targeted = event.conditions?.departments;
      if (targeted) expect(targeted).toContain(department);
    }
  });
});

describe('translation', () => {
  it('resolves every generated content key', () => {
    for (const event of allEvents) {
      expect(translate('en', event.titleKey)).not.toBe(event.titleKey);
      expect(translate('en', event.bodyKey)).not.toBe(event.bodyKey);
    }
  });

  it('interpolates parameters', () => {
    expect(translate('en', 'dash.month', { turn: 7 })).toBe('Month 7');
  });

  it('translates a parameter that is itself a key', () => {
    // The engine logs content keys, not prose; the log line has to resolve them.
    expect(translate('en', 'log.offer_received', { org: 'career.3.org_short' })).toBe(
      'An offer arrived from the Region.',
    );
  });

  it('leaves an unknown parameter visible rather than blank', () => {
    expect(translate('en', 'dash.month', {})).toBe('Month {turn}');
  });

  it('returns the key itself when a string is missing', () => {
    expect(translate('en', 'no.such.key')).toBe('no.such.key');
  });

  it('has no empty strings in the corpus', () => {
    for (const [key, value] of Object.entries(EN_STRINGS)) {
      expect(value.trim(), `empty string for ${key}`).not.toBe('');
    }
  });
});
