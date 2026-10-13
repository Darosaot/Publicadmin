import { describe, expect, it } from 'vitest';
import {
  challengeFor,
  dayLabel,
  parseChallengeId,
  weekLabel,
} from '../../src/engine/challenge';
import { createGame } from '../../src/engine/newGame';
import { deserialize, saveFileName, serialize } from '../../src/engine/save';
import { DEPARTMENT_IDS } from '../../src/engine/types';
import { makeQuietRegistry } from './fixtures';

const registry = makeQuietRegistry();

describe('shared challenges', () => {
  it('gives everyone the same run on the same UTC day, wherever they are', () => {
    const early = challengeFor('daily', new Date('2026-10-13T00:00:01Z'));
    const late = challengeFor('daily', new Date('2026-10-13T23:59:59Z'));
    expect(late).toEqual(early);
    expect(early.id).toBe('daily:2026-10-13');
  });

  it('gives a different run on a different day', () => {
    const seeds = new Set(
      Array.from({ length: 30 }, (_, i) =>
        challengeFor('daily', new Date(Date.UTC(2026, 9, 1 + i))).seed,
      ),
    );
    expect(seeds.size).toBe(30);
  });

  it('produces seeds and departments the engine can use', () => {
    for (let i = 0; i < 200; i += 1) {
      const c = challengeFor('daily', new Date(Date.UTC(2026, 0, 1 + i)));
      expect(Number.isInteger(c.seed)).toBe(true);
      expect(c.seed).toBeGreaterThan(0);
      expect(c.seed).toBeLessThan(2_147_483_647);
      expect(DEPARTMENT_IDS).toContain(c.department);
    }
  });

  it('does not always land on the same department', () => {
    const departments = new Set(
      Array.from({ length: 60 }, (_, i) =>
        challengeFor('daily', new Date(Date.UTC(2026, 0, 1 + i))).department,
      ),
    );
    expect(departments.size).toBeGreaterThanOrEqual(5);
  });

  it('keeps one weekly run for the whole ISO week, Monday to Sunday', () => {
    const monday = challengeFor('weekly', new Date('2026-10-12T08:00:00Z'));
    const sunday = challengeFor('weekly', new Date('2026-10-18T22:00:00Z'));
    const nextMonday = challengeFor('weekly', new Date('2026-10-19T00:00:00Z'));
    expect(sunday).toEqual(monday);
    expect(nextMonday.id).not.toBe(monday.id);
    expect(monday.id).toBe('weekly:2026-W42');
  });

  it('numbers weeks by ISO 8601 across a year boundary', () => {
    // 2026-01-01 is a Thursday, so it is week 1 of 2026; 2024-12-30 is a Monday in week 1 of 2025.
    expect(weekLabel(new Date('2026-01-01T12:00:00Z'))).toBe('2026-W01');
    expect(weekLabel(new Date('2024-12-30T12:00:00Z'))).toBe('2025-W01');
    expect(weekLabel(new Date('2021-01-03T12:00:00Z'))).toBe('2020-W53');
    expect(dayLabel(new Date('2026-03-05T23:59:59Z'))).toBe('2026-03-05');
  });

  it('parses its own ids and rejects anything else', () => {
    expect(parseChallengeId('weekly:2026-W42')).toEqual({ kind: 'weekly', label: '2026-W42' });
    expect(parseChallengeId('monthly:2026-10')).toBeUndefined();
    expect(parseChallengeId(undefined)).toBeUndefined();
    expect(parseChallengeId('daily')).toBeUndefined();
  });

  it('plays the same career for two people who chose different names', () => {
    const c = challengeFor('daily', new Date('2026-10-13T12:00:00Z'));
    const make = (name: string) =>
      createGame({ name, department: c.department, seed: c.seed, challenge: c.id }, registry);
    const a = make('Ada');
    const b = make('Bo');
    expect(a.rngState).toBe(b.rngState);
    expect(a.challenge).toBe(c.id);
    expect(a.tasks).toEqual(b.tasks);
  });

  it('leaves ordinary careers unlabelled', () => {
    const game = createGame({ name: 'Ada', department: 'legal', seed: 5 }, registry);
    expect('challenge' in game).toBe(false);
  });
});

describe('exporting a save', () => {
  it('round-trips through the same text a file would carry', () => {
    const game = createGame(
      { name: 'Ada', department: 'legal', seed: 5, challenge: 'weekly:2026-W42' },
      registry,
    );
    const result = deserialize(serialize(game), registry);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.state).toEqual(game);
  });

  it('refuses text that is not a save, without throwing', () => {
    expect(deserialize('not json', registry)).toEqual({ ok: false, reason: 'corrupt' });
    expect(deserialize('{"hello":1}', registry)).toEqual({ ok: false, reason: 'corrupt' });
    expect(deserialize('[]', registry).ok).toBe(false);
    expect(deserialize('', registry)).toEqual({ ok: false, reason: 'empty' });
  });

  it('names the file after the person and the cycle, safely', () => {
    const game = createGame({ name: '  Inés  Reyes/../x ', department: 'legal', seed: 5 }, registry);
    expect(saveFileName(game)).toBe('public-service-story-ines-reyes-x-cycle-1.json');
    const anon = createGame({ name: '###', department: 'legal', seed: 5 }, registry);
    // Falls back to the default name, which is a valid slug.
    expect(saveFileName(anon)).toMatch(/^public-service-story-[a-z-]+-cycle-1\.json$/);
  });
});
