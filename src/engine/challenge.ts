/**
 * Shared challenges: everybody who plays today's run plays the same one.
 *
 * There is no server, so "the same" has to come from something every device already agrees on,
 * and that is the date. The challenge id is the UTC day or ISO week; the seed and the department
 * are both hashed out of that id. Two people on opposite sides of the Atlantic get the same
 * career on the same day without anything having been uploaded anywhere.
 *
 * UTC, not local time, on purpose. A challenge that changes at a different moment for each player
 * is not a shared one, and "Brussels midnight" is nobody's midnight but ours.
 *
 * The department is fixed too. Letting each player choose one would make two scores incomparable,
 * since the departments differ in how hard they are by design.
 */

import { DEPARTMENT_IDS, type DepartmentId } from './types';

export type ChallengeKind = 'daily' | 'weekly';

export interface Challenge {
  /** `daily:2026-10-13` or `weekly:2026-W42`. Also what a career records about itself. */
  id: string;
  kind: ChallengeKind;
  /** The date part alone, for display. */
  label: string;
  seed: number;
  department: DepartmentId;
}

/** FNV-1a. Small, stable across engines, and good enough to spread nearby dates apart. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** `2026-10-13` for the UTC day. */
export function dayLabel(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/**
 * `2026-W42`, by ISO 8601: weeks start on Monday and belong to the year that holds their Thursday,
 * which is what makes the last days of December sometimes week 1 of the next year.
 */
export function weekLabel(date: Date): string {
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const weekday = day.getUTCDay() || 7;
  day.setUTCDate(day.getUTCDate() + 4 - weekday);
  const yearStart = Date.UTC(day.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((day.getTime() - yearStart) / 86_400_000 + 1) / 7);
  return `${day.getUTCFullYear()}-W${pad(week)}`;
}

export function challengeFor(kind: ChallengeKind, date: Date): Challenge {
  const label = kind === 'daily' ? dayLabel(date) : weekLabel(date);
  const id = `${kind}:${label}`;
  const h = hash(id);
  return {
    id,
    kind,
    label,
    // The engine's seeds are positive 31-bit integers.
    seed: (h % 2_147_483_646) + 1,
    department: DEPARTMENT_IDS[hash(`${id}:department`) % DEPARTMENT_IDS.length]!,
  };
}

/** Splits a stored id back into its parts; undefined for anything that is not one. */
export function parseChallengeId(id: string | undefined): { kind: ChallengeKind; label: string } | undefined {
  if (!id) return undefined;
  const [kind, label] = id.split(':');
  if ((kind !== 'daily' && kind !== 'weekly') || !label) return undefined;
  return { kind, label };
}
