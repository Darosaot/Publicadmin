import { describe, expect, it } from 'vitest';
import { endingCopy, registry } from '../../src/content';
import { createGame } from '../../src/engine/newGame';
import { translate } from '../../src/i18n/translate';
import type { EndingId, GameState, TurnSample } from '../../src/engine/types';
import { blockSpark, buildSummary, shareUrl, summaryText } from '../../src/ui/summary';

const t = (key: string, params?: Record<string, string | number>) => translate('en', key, params);

function row(turn: number, reputation: number, level = 1): TurnSample {
  return {
    turn,
    calendarMonth: turn,
    postId: registry.posts.find((p) => p.tier === 1)!.id,
    level,
    reputation,
    performance: 50,
    politicalCapital: 10,
    integrity: 70,
    stress: 20,
    salary: 2100,
    savings: 1400,
  };
}

function finished(over: Partial<GameState> = {}): GameState {
  const game = createGame({ name: 'Ada Fixture', department: 'procurement', seed: 7 }, registry);
  return {
    ...game,
    phase: 'ended',
    ending: 'retirement_honoured',
    calendarMonth: 360,
    history: [row(1, 20), row(2, 60, 2), row(3, 90, 3)],
    ...over,
  };
}

const titleKey = (ending: EndingId) => endingCopy[ending].titleKey;

describe('summarising a career', () => {
  it('has nothing to say about a career that has not ended', () => {
    const game = createGame({ name: 'Ada', department: 'legal', seed: 1 }, registry);
    expect(buildSummary(game, registry, titleKey)).toBeUndefined();
  });

  it('reads the facts off the final state', () => {
    const summary = buildSummary(finished(), registry, titleKey)!;
    expect(summary.name).toBe('Ada Fixture');
    expect(summary.years).toBe(30);
    expect(summary.peakTier).toBe(3);
    expect(summary.reputation).toEqual([20, 60, 90]);
    expect(summary.seed).toBe(7);
    expect(summary.rival).toBeUndefined();
    expect(summary.challenge).toBeUndefined();
  });

  it('compares with Elena only if the player ever met her', () => {
    const game = finished();
    expect(buildSummary(game, registry, titleKey)!.rival).toBeUndefined();

    const met = finished({ flags: { ...game.flags, 'met.vasquez': true } });
    expect(buildSummary(met, registry, titleKey)!.rival).toBeDefined();

    const left = finished({
      flags: { ...game.flags, 'met.vasquez': true },
      rival: { ...game.rival!, left: true },
    });
    expect(buildSummary(left, registry, titleKey)!.rival).toBe('left');
  });

  it('records which shared challenge it was', () => {
    const summary = buildSummary(finished({ challenge: 'daily:2026-10-13' }), registry, titleKey)!;
    expect(summary.challenge).toEqual({ kind: 'daily', label: '2026-10-13' });
  });
});

describe('the text version', () => {
  it('carries the headline facts and a link', () => {
    const summary = buildSummary(finished(), registry, titleKey)!;
    const text = summaryText(summary, t, 'https://example.test/?seed=7');
    expect(text).toContain('Ada Fixture');
    expect(text).toContain(t('ending.retirement_honoured.title'));
    expect(text).toContain('30 years');
    expect(text).toContain('Seed 7');
    expect(text.split('\n').at(-1)).toBe('https://example.test/?seed=7');
  });

  it('names the challenge instead of the seed when there is one', () => {
    const summary = buildSummary(finished({ challenge: 'weekly:2026-W42' }), registry, titleKey)!;
    const text = summaryText(summary, t, 'https://example.test/');
    expect(text).toContain('Weekly challenge 2026-W42');
    expect(text).not.toContain('Seed');
  });

  it('shares a seed link for free play and the bare page for a challenge', () => {
    const free = buildSummary(finished(), registry, titleKey)!;
    const daily = buildSummary(finished({ challenge: 'daily:2026-10-13' }), registry, titleKey)!;
    expect(shareUrl(free, 'https://example.test/play/?seed=99#x')).toBe('https://example.test/play/?seed=7');
    expect(shareUrl(daily, 'https://example.test/play/?seed=99')).toBe('https://example.test/play/');
  });
});

describe('the block sparkline', () => {
  it('is empty for no data and never wider than asked', () => {
    expect(blockSpark([])).toBe('');
    expect(blockSpark(Array.from({ length: 120 }, (_, i) => i), 24)).toHaveLength(24);
    expect(blockSpark([10, 20], 24)).toHaveLength(2);
  });

  it('is pinned to the 0 to 100 axis, so a flat career looks flat', () => {
    expect(new Set(blockSpark([50, 50, 50, 50])).size).toBe(1);
    expect(blockSpark([0, 100])).toBe('▁█');
    // Out-of-range values are clamped rather than throwing.
    expect(blockSpark([-20, 400])).toBe('▁█');
  });
});
