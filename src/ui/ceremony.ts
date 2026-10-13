/**
 * The moments that deserve more than a line in a list.
 *
 * The engine has always told a landed nine-year initiative from a Tuesday: it tracks them
 * separately, schedules them separately, and pays them out separately. The interface did not. All
 * of them arrived as one more row in the same modal, at the same size, with the same button.
 *
 * This file decides which moments are big enough, by comparing the state the player was looking at
 * with the state they are looking at now. It reads the engine and never writes to it: a ceremony
 * is presentation, so nothing in a save depends on one having been seen, and a reload simply
 * does not replay it.
 */

import type { ContentRegistry } from '../engine/registry';
import { getPost } from '../engine/registry';
import type { EndingId, GameState } from '../engine/types';

export type Ceremony =
  | { kind: 'promotion'; postId: string; tier: number }
  | { kind: 'initiative'; templateId: string }
  | { kind: 'farewell'; name: string; years: number; reason: 'morale' | 'promoted_away' }
  | { kind: 'ministry' };

/**
 * Initiatives that take at least this many cycles at the very best are the long ones. A twelve-
 * month working group finishing is a good month; this is for the ones the player has been paying
 * into for years.
 */
export const LONG_INITIATIVE_CYCLES = 7;

/**
 * How many turns somebody has been in the unit before their going is a ceremony.
 *
 * `monthsInPost` counts turns despite its name (it ticks once a cycle), so at a senior desk this
 * is most of a decade. Anyone shorter than that is a colleague, and a line in the report is the
 * right size for a colleague.
 */
export const LONG_SERVICE_TURNS = 36;

/** Turns of service converted to the years the sentence will say, using the post's own clock. */
function yearsOf(turns: number, monthsPerTurn: number): number {
  return Math.max(1, Math.round((turns * monthsPerTurn) / 12));
}

/** The same career, carried forward, and not a different one that happens to follow it. */
function sameCareer(before: GameState, after: GameState): boolean {
  return (
    before.seed === after.seed &&
    before.player.name === after.player.name &&
    after.turn >= before.turn
  );
}

export function detectCeremonies(
  before: GameState | null,
  after: GameState | null,
  registry: ContentRegistry,
): Ceremony[] {
  if (!before || !after || !sameCareer(before, after)) return [];

  const found: Ceremony[] = [];

  // A step up the ladder. A move sideways to another track at the same tier is a decision, not a
  // coronation, and so is a fall.
  if (before.player.postId !== after.player.postId && after.player.level > before.player.level) {
    found.push({ kind: 'promotion', postId: after.player.postId, tier: after.player.level });
  }

  if (after.lastReport && after.lastReport !== before.lastReport) {
    for (const id of after.lastReport.initiativesCompleted ?? []) {
      const template = registry.initiatives.find((t) => t.id === id);
      if (template && template.minCycles >= LONG_INITIATIVE_CYCLES) {
        found.push({ kind: 'initiative', templateId: id });
      }
    }

    // One farewell a month at most: the longest-serving of whoever left. Two at once is a bad
    // month, and it is the report's job to say so.
    const leavers = (after.lastReport.team?.departures ?? [])
      .map((departure) => ({
        departure,
        member: before.staff.find((s) => s.name === departure.name),
      }))
      .filter(
        (entry): entry is typeof entry & { member: NonNullable<typeof entry.member> } =>
          entry.member !== undefined && entry.member.monthsInPost >= LONG_SERVICE_TURNS,
      )
      .sort((a, b) => b.member.monthsInPost - a.member.monthsInPost);

    const first = leavers[0];
    if (first) {
      const monthsPerTurn = getPost(registry, before.player.postId).monthsPerTurn;
      found.push({
        kind: 'farewell',
        name: first.member.name,
        years: yearsOf(first.member.monthsInPost, monthsPerTurn),
        reason: first.departure.reason,
      });
    }
  }

  if (before.phase !== 'ended' && after.phase === 'ended' && after.ending === ('minister' satisfies EndingId)) {
    found.push({ kind: 'ministry' });
  }

  return found;
}
