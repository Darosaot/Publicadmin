/**
 * A finished career, boiled down to what fits on a card.
 *
 * Everything here is read from the final state and the content registry; nothing is stored, so a
 * summary can be rebuilt for any ended career and cannot disagree with the Record or the
 * epilogue it summarises. The builder returns data, and the two renderers (text for a clipboard,
 * canvas for an image) each take that same data, so the card and the text can never say
 * different things.
 */

import { yearsElapsed } from '../engine/calendar';
import { parseChallengeId, type ChallengeKind } from '../engine/challenge';
import type { ContentRegistry } from '../engine/registry';
import { getPost } from '../engine/registry';
import { rivalPost } from '../engine/rival';
import type { EndingId, GameState, TrackId } from '../engine/types';

export type RivalVerdict = 'ahead' | 'behind' | 'level' | 'left';

export interface CareerSummary {
  name: string;
  /** Translation keys, resolved by whoever renders the card. */
  departmentKey: string;
  endingKey: string;
  endingId: EndingId;
  track: TrackId;
  years: number;
  finalPost: { titleKey: string; orgKey: string };
  peakTier: number;
  /** Reputation, one value per cycle, oldest first. */
  reputation: number[];
  /** Absent when the player never met Elena, since there is nothing to compare. */
  rival?: RivalVerdict;
  challenge?: { kind: ChallengeKind; label: string };
  seed: number;
}

export function buildSummary(
  game: GameState,
  registry: ContentRegistry,
  endingTitleKey: (ending: EndingId) => string,
): CareerSummary | undefined {
  if (!game.ending) return undefined;

  const post = getPost(registry, game.player.postId);
  const peakTier = Math.max(game.player.level, ...game.history.map((row) => row.level));

  let rival: RivalVerdict | undefined;
  if (game.rival && game.flags['met.vasquez']) {
    const herPost = rivalPost(game, registry);
    if (game.rival.left || !herPost) rival = 'left';
    else if (herPost.tier > game.player.level) rival = 'ahead';
    else if (herPost.tier < game.player.level) rival = 'behind';
    else rival = 'level';
  }

  const challenge = parseChallengeId(game.challenge);

  return {
    name: game.player.name,
    departmentKey: registry.departments[game.player.department].nameKey,
    endingKey: endingTitleKey(game.ending),
    endingId: game.ending,
    track: game.player.track,
    years: yearsElapsed(game),
    finalPost: { titleKey: post.titleKey, orgKey: post.orgKey },
    peakTier,
    reputation: game.history.map((row) => row.reputation),
    ...(rival ? { rival } : {}),
    ...(challenge ? { challenge } : {}),
    seed: game.seed,
  };
}

const BLOCKS = '▁▂▃▄▅▆▇█';

/**
 * A series as a row of block characters, averaged down to at most `width` cells.
 *
 * Fixed to the 0 to 100 stat axis rather than to the series' own range, for the reason the Record
 * screen gives: a career that never moved should look flat, not dramatic.
 */
export function blockSpark(series: readonly number[], width = 24): string {
  if (series.length === 0) return '';
  const cells = Math.min(width, series.length);
  let out = '';
  for (let i = 0; i < cells; i += 1) {
    const from = Math.floor((i * series.length) / cells);
    const to = Math.max(from + 1, Math.floor(((i + 1) * series.length) / cells));
    const slice = series.slice(from, to);
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
    const level = Math.round((Math.min(100, Math.max(0, mean)) / 100) * (BLOCKS.length - 1));
    out += BLOCKS[level];
  }
  return out;
}

type Translate = (key: string, params?: Record<string, string | number>) => string;

/** The line under the headline that says which shared run this was, if it was one. */
export function challengeLine(summary: CareerSummary, t: Translate): string | undefined {
  if (!summary.challenge) return undefined;
  return t(`summary.challenge_${summary.challenge.kind}`, { label: summary.challenge.label });
}

/** The plain-text version, for a clipboard, a chat or a forum post. */
export function summaryText(summary: CareerSummary, t: Translate, url: string): string {
  const lines = [
    t('app.title'),
    `${summary.name}: ${t(summary.endingKey)}`,
    `${t(summary.departmentKey)} · ${t(`track.${summary.track}`)} · ${t('summary.years', { years: summary.years })}`,
    `${t('summary.final_post')}: ${t(summary.finalPost.titleKey)}, ${t(summary.finalPost.orgKey)}`,
    `${t('stat.reputation')} ${blockSpark(summary.reputation)}`,
  ];
  if (summary.rival) lines.push(t(`summary.rival_${summary.rival}`));
  lines.push(challengeLine(summary, t) ?? `${t('summary.seed')} ${summary.seed}`);
  lines.push(url);
  return lines.join('\n');
}

/**
 * Where a friend should go to play it. A shared challenge needs nothing but the page, since the
 * date is the seed; any other run carries its seed in the link so the same career can be tried.
 */
export function shareUrl(summary: CareerSummary, base: string): string {
  const clean = base.split('?')[0]!.split('#')[0]!;
  return summary.challenge ? clean : `${clean}?seed=${summary.seed}`;
}
