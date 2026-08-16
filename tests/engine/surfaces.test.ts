/**
 * Does anything ever show this to the player?
 *
 * The engine has produced data no screen consumed five separate times: `initiativesCompleted`,
 * `initiativesLapsed`, `TeamReport.promotions`, `budgetDelta`, `promotedTo`, and `nowAt` — the
 * last of which was reported as fixed after being made *written* while still being read by
 * nothing. Each was invisible because every guard written at the time tested the producing side.
 *
 * `validate.ts` runs exactly this census for content flags, and has since twenty-five of
 * twenty-seven flags turned out to be write-only. This is the same census for engine fields, and
 * it exists because the lesson evidently did not transfer on its own.
 *
 * It works on source text rather than types, which is crude and is the point: a field added to one
 * of these interfaces is covered the moment it is declared, with nothing to remember.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = new URL('../../', import.meta.url).pathname;

/** The interfaces whose whole purpose is to be shown to somebody. */
const REPORTING_TYPES = ['TurnReport', 'TeamReport', 'DepartedStaff'];

/**
 * Fields the player is deliberately never shown, with the reason.
 *
 * Kept deliberately short. "The UI does not need it" is not a reason — if nothing needs it, the
 * engine should not be computing it.
 */
const NOT_FOR_THE_PLAYER: Record<string, string> = {
  turn: 'the modal titles itself from the calendar rather than the raw turn number',
  leftOnTurn: 'orders the roster; the epilogue says who rather than when',
};

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) sourceFiles(path, out);
    else if (/\.tsx?$/.test(entry)) out.push(path);
  }
  return out;
}

/** Field names declared on an interface, read straight out of the type source. */
function fieldsOf(source: string, name: string): string[] {
  const start = source.indexOf(`export interface ${name} {`);
  if (start === -1) throw new Error(`no interface ${name} in types.ts`);

  const body = source.slice(start, source.indexOf('\n}', start));
  return [...body.matchAll(/^\s{2}(\w+)\??:/gm)].map((match) => match[1]!);
}

describe('everything the engine reports is shown to somebody', () => {
  const types = readFileSync(join(ROOT, 'src/engine/types.ts'), 'utf8');
  const ui = sourceFiles(join(ROOT, 'src/ui'))
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');

  it.each(REPORTING_TYPES)('%s', (name) => {
    const unread = fieldsOf(types, name).filter(
      (field) => NOT_FOR_THE_PLAYER[field] === undefined && !new RegExp(`\\b${field}\\b`).test(ui),
    );

    expect(
      unread,
      `${name} declares fields no screen ever reads. Either render them, delete them, or add ` +
        `them to NOT_FOR_THE_PLAYER with a reason.`,
    ).toEqual([]);
  });

  /**
   * The exemption list is the part that rots. A name left in it after the field is gone reads as
   * a considered decision about something that no longer exists.
   */
  it('has no stale exemptions', () => {
    const declared = new Set(REPORTING_TYPES.flatMap((name) => fieldsOf(types, name)));
    const stale = Object.keys(NOT_FOR_THE_PLAYER).filter((field) => !declared.has(field));

    expect(stale, 'NOT_FOR_THE_PLAYER names fields that no longer exist').toEqual([]);
  });
});
