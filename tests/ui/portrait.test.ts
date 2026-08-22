import { describe, expect, it } from 'vitest';
import { staffNames } from '../../src/content';
import { portraitFor, portraitRects, type Portrait } from '../../src/ui/portrait';

/** Rebuild a flat grid from the run-length encoding, so the two can be compared cell by cell. */
function expand(portrait: Portrait): (string | null)[] {
  const grid: (string | null)[] = new Array(portrait.size * portrait.size).fill(null);
  for (const rect of portraitRects(portrait)) {
    for (let i = 0; i < rect.width; i += 1) grid[rect.y * portrait.size + rect.x + i] = rect.fill;
  }
  return grid;
}

describe('a face is a function of a name', () => {
  /**
   * The whole reason this is generated rather than stored: a save reloaded nine years later has
   * only the name, and the person has to come back with the same face.
   */
  it('gives the same person the same face every time', () => {
    const once = portraitFor('Tomas Bergqvist');
    const again = portraitFor('Tomas Bergqvist');
    expect(again.cells).toEqual(once.cells);
  });

  it('does not give two people the same face because their names are similar', () => {
    // FNV-1a rather than a digit sum, precisely so these three do not collapse together.
    const a = portraitFor('Ana Silva');
    const b = portraitFor('Ana Silvo');
    const c = portraitFor('Anb Silva');
    expect(a.cells).not.toEqual(b.cells);
    expect(a.cells).not.toEqual(c.cells);
    expect(b.cells).not.toEqual(c.cells);
  });

  /**
   * A generator that technically varies but produces forty near-identical brown-haired men is
   * worse than no generator, because the screen then implies a uniformity the writing denies.
   */
  it('draws the real cast as distinct faces', () => {
    const seen = new Set(staffNames.map((name) => JSON.stringify(portraitFor(name).cells)));
    expect(seen.size).toBe(staffNames.length);
  });

  it('fills every cell with a colour or nothing at all', () => {
    const portrait = portraitFor('Hélène Duquesne');
    expect(portrait.cells).toHaveLength(portrait.size * portrait.size);
    for (const cell of portrait.cells) {
      if (cell !== null) expect(cell).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe('the run-length encoding', () => {
  /** The renderer draws rects, not cells, so if this is lossy every face is quietly wrong. */
  it('reproduces the grid exactly', () => {
    for (const name of staffNames.slice(0, 20)) {
      const portrait = portraitFor(name);
      expect(expand(portrait)).toEqual(portrait.cells);
    }
  });

  it('is worth doing at all', () => {
    const portrait = portraitFor('Katalin Varga');
    const drawn = portrait.cells.filter((c) => c !== null).length;
    // The claim in the doc comment is "roughly three quarters"; hold it to half.
    expect(portraitRects(portrait).length).toBeLessThan(drawn / 2);
  });
});
