import { describe, expect, it } from 'vitest';
import { createGame } from '../../src/engine/newGame';
import { eligibleRandomEvents } from '../../src/engine/events';
import { registry, allEvents, allTasks, careerLevels, EN_STRINGS } from '../../src/content';
import { validateContent } from '../../src/content/validate';
import { translate } from '../../src/i18n/translate';
import { DEPARTMENT_IDS, type DepartmentId } from '../../src/engine/types';

describe('content validation', () => {
  it('has no structural problems', () => {
    expect(validateContent()).toEqual([]);
  });
});

describe('corpus size', () => {
  it('ships enough events that a long career does not repeat itself', () => {
    expect(allEvents.length).toBeGreaterThanOrEqual(160);
  });

  it('ships enough task templates to keep the board varied', () => {
    expect(allTasks.length).toBeGreaterThanOrEqual(60);
  });

  it('covers every kind of event', () => {
    const kinds = new Set(allEvents.map((e) => e.kind));
    expect(kinds).toEqual(new Set(['random', 'milestone', 'followup']));
  });

  it('gives every department a comparable amount of its own material', () => {
    for (const department of DEPARTMENT_IDS) {
      const own = allEvents.filter((e) => e.conditions?.departments?.includes(department));
      expect(own.length, `${department} has too little of its own`).toBeGreaterThanOrEqual(12);
    }
  });
});

describe('consequences are reachable', () => {
  /** Every event id that some choice, outcome or task result schedules. */
  const scheduled = new Set<string>();
  for (const event of allEvents) {
    for (const choice of event.choices) {
      for (const outcome of choice.outcomes) {
        for (const effect of outcome.effects) {
          if (effect.kind === 'queueEvent') scheduled.add(effect.eventId);
        }
      }
    }
  }
  for (const task of allTasks) {
    const effects = [...Object.values(task.onComplete ?? {}).flat(), ...(task.onFail ?? [])];
    for (const effect of effects) {
      if (effect.kind === 'queueEvent') scheduled.add(effect.eventId);
    }
  }

  it('never schedules an event that does not exist', () => {
    for (const id of scheduled) expect(registry.events[id], `missing ${id}`).toBeDefined();
  });

  it('has no followup that nothing can lead to', () => {
    // Followups are never drawn at random, so an unscheduled one is content nobody can ever see.
    const orphans = allEvents
      .filter((e) => e.kind === 'followup' && !scheduled.has(e.id))
      .map((e) => e.id);
    expect(orphans).toEqual([]);
  });
});

describe('every department is playable', () => {
  const departments = DEPARTMENT_IDS;

  it.each(departments)('%s has work available at level 1', (department: DepartmentId) => {
    const state = createGame({ name: 'Test', department, seed: 5 }, registry);
    expect(state.tasks.length).toBe(careerLevels[0]!.taskSlots);
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

describe('the desk changes with the post', () => {
  const eligibleAt = (department: DepartmentId, level: number) =>
    new Set(
      allTasks
        .filter(
          (task) =>
            (task.departments === 'any' || task.departments.includes(department)) &&
            (task.minLevel ?? 1) <= level &&
            (task.maxLevel ?? Infinity) >= level,
        )
        .map((task) => task.id),
    );

  it.each(DEPARTMENT_IDS)('%s sees different work at the top than at the bottom', (department: DepartmentId) => {
    const junior = eligibleAt(department, 1);
    const top = eligibleAt(department, careerLevels[careerLevels.length - 1]!.level);

    // Work that has been left behind, and work that has opened up.
    const retired = [...junior].filter((id) => !top.has(id));
    const unlocked = [...top].filter((id) => !junior.has(id));

    expect(retired.length, 'clerical work should stop appearing').toBeGreaterThan(0);
    expect(unlocked.length, 'senior work should appear').toBeGreaterThan(2);
  });

  it('never puts the inbox backlog on a director’s desk', () => {
    expect(eligibleAt('finance', 5).has('task.shared.inbox')).toBe(false);
    expect(eligibleAt('finance', 1).has('task.shared.inbox')).toBe(true);
  });

  it('opens management work only once there is something to manage', () => {
    expect(eligibleAt('policy', 1).has('task.senior.workforce_plan')).toBe(false);
    expect(eligibleAt('policy', 5).has('task.senior.workforce_plan')).toBe(true);
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
    expect(translate('en', 'dash.of_max', { turn: 7, max: 120 })).toBe('cycle 7 of 120');
  });

  it('translates a parameter that is itself a key', () => {
    // The engine logs content keys, not prose; the log line has to resolve them.
    expect(translate('en', 'log.offer_received', { org: 'career.3.org_short' })).toBe(
      'An offer arrived from the Region.',
    );
  });

  it('leaves an unknown parameter visible rather than blank', () => {
    expect(translate('en', 'dash.of_max', { max: 120 })).toBe('cycle {turn} of 120');
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
