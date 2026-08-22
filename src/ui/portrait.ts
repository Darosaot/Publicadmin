/**
 * Faces, generated rather than drawn.
 *
 * The game invents its people at runtime — a career meets forty-odd staff whose names are picked
 * from a list and whose numbers come out of the RNG — so there is no drawing a portrait for each
 * of them in advance. Every face here is therefore a pure function of a seed string, which in
 * practice is the person's name: the same person always looks the same, in this session and in a
 * save reloaded nine years later, without a byte of it being stored.
 *
 * They are deliberately staff-pass photographs rather than heroic RPG portraits. A head, a
 * shoulder line, a collar and a lanyard, shot against a flat institutional background. It is the
 * one piece of art direction the subject matter chooses for itself.
 *
 * Pure and DOM-free on purpose: `Portrait.tsx` renders it, `portrait.test.ts` checks it, and
 * neither one can drift from the other.
 */

import { nextInt } from '../engine/rng';

export interface Portrait {
  /** Grid is square; cells are row-major, `null` where nothing is drawn. */
  size: number;
  cells: (string | null)[];
}

/** One horizontal run of identical cells — what the renderer actually emits. */
export interface PortraitRect {
  x: number;
  y: number;
  width: number;
  fill: string;
}

const SIZE = 16;

const BACKS = ['#3c4a72', '#4a3c5e', '#35566b', '#5e4a3c', '#3f5a4a', '#524154'];
const SKINS = ['#ffdbb4', '#f2c9a0', '#e0a877', '#c68642', '#8d5524', '#5c3317'];
const HAIRS = [
  '#1a1a22', '#2b1d0e', '#4a2c12', '#7b4a1e',
  '#b5852f', '#d9c07a', '#8a8a8a', '#e8e8e8', '#6b2d2d',
];
const SHIRTS = ['#eef1fb', '#cdd8f0', '#e6ebe0', '#f0e6d8', '#dfe0ea'];
const JACKETS = ['#232a4d', '#1f2a44', '#3a2f45', '#2f4038', '#43314a', '#4a3520'];
const LANYARDS = ['#bd3030', '#2a6ec4', '#b8791a', '#24803f', '#7a3bb5'];

const HAIR_STYLES = [
  'short', 'parted', 'long', 'bun', 'receding', 'cropped', 'cap', 'bald',
] as const;
type HairStyle = (typeof HAIR_STYLES)[number];

/**
 * Seed a face from a name.
 *
 * `seedToState` in the engine takes a number, and two names differing in one letter must not
 * produce two faces differing in one pixel, so the string is folded with FNV-1a first — cheap,
 * well-mixed, and stable across engines in a way `hashCode`-style sums are not.
 */
function seedFrom(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash | 0;
}

/** A tiny sequential picker, so the drawing code below reads as a list of choices. */
function chooser(seed: number) {
  let state = seed;
  return {
    int(min: number, max: number): number {
      const roll = nextInt(state, min, max);
      state = roll.rngState;
      return roll.value;
    },
    from<T>(items: readonly T[]): T {
      const roll = nextInt(state, 0, items.length - 1);
      state = roll.rngState;
      return items[roll.value]!;
    },
    chance(percent: number): boolean {
      const roll = nextInt(state, 1, 100);
      state = roll.rngState;
      return roll.value <= percent;
    },
  };
}

/** Darken a hex colour toward black by `amount` (0–1). Used for shadow under the jaw and brim. */
function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * (1 - amount));
  const g = Math.round(((n >> 8) & 255) * (1 - amount));
  const b = Math.round((n & 255) * (1 - amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function portraitFor(seed: string): Portrait {
  const pick = chooser(seedFrom(seed));
  const cells: (string | null)[] = new Array(SIZE * SIZE).fill(null);

  const set = (x: number, y: number, colour: string | null) => {
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
    cells[y * SIZE + x] = colour;
  };
  const row = (y: number, from: number, to: number, colour: string | null) => {
    for (let x = from; x <= to; x += 1) set(x, y, colour);
  };
  const block = (x0: number, y0: number, x1: number, y1: number, colour: string | null) => {
    for (let y = y0; y <= y1; y += 1) row(y, x0, x1, colour);
  };

  const back = pick.from(BACKS);
  const skin = pick.from(SKINS);
  const hair = pick.from(HAIRS);
  const shirt = pick.from(SHIRTS);
  const jacket = pick.from(JACKETS);
  const lanyard = pick.from(LANYARDS);
  const style: HairStyle = pick.from(HAIR_STYLES);
  const glasses = pick.chance(28);
  const beard = pick.chance(22);
  const smiling = pick.chance(45);

  /* --------------------------------------------------------------- background */

  block(0, 0, 15, 15, back);
  // Every pass photo has the sitter standing in front of something, and the something is lit
  // from above — so the wall darkens where the shoulders begin to occlude it.
  row(10, 0, 15, shade(back, 0.18));
  block(0, 11, 15, 15, shade(back, 0.28));

  /* ------------------------------------------------------------------ shoulders */

  block(2, 13, 13, 15, jacket);
  block(1, 14, 14, 15, jacket);
  // Collar: two wedges of shirt opening away from the neck.
  set(6, 13, shirt);
  set(9, 13, shirt);
  block(6, 14, 9, 14, shirt);
  set(5, 14, shade(jacket, 0.25));
  set(10, 14, shade(jacket, 0.25));
  // The lanyard, which is the most reliably true detail in the whole game.
  block(7, 15, 8, 15, lanyard);
  set(6, 14, lanyard);
  set(9, 14, lanyard);

  /* ----------------------------------------------------------------- head and neck */

  block(7, 11, 8, 12, skin);
  set(6, 12, shade(skin, 0.28));
  set(9, 12, shade(skin, 0.28));

  block(4, 3, 11, 10, skin);
  // Ears sit below the temples, not beside the eyes.
  set(3, 6, skin);
  set(12, 6, skin);
  set(3, 7, shade(skin, 0.15));
  set(12, 7, shade(skin, 0.15));
  // Jawline: the corners come off so the head is not a literal square.
  set(4, 10, shade(skin, 0.2));
  set(11, 10, shade(skin, 0.2));

  /* ---------------------------------------------------------------------- hair */

  if (style === 'cap') {
    const cap = pick.from(JACKETS);
    block(4, 2, 11, 3, cap);
    row(4, 3, 12, shade(cap, 0.3));
    set(3, 4, shade(cap, 0.3));
  } else if (style === 'bald') {
    /* nothing at all */
  } else {
    block(4, 2, 11, 2, hair);
    if (style === 'short' || style === 'cropped') {
      row(3, 4, 11, hair);
      if (style === 'short') {
        set(4, 4, hair);
        set(11, 4, hair);
      }
    } else if (style === 'parted') {
      row(3, 4, 11, hair);
      block(4, 4, 6, 4, hair);
      set(11, 4, hair);
    } else if (style === 'receding') {
      row(3, 5, 10, hair);
      set(4, 3, null);
    } else if (style === 'long') {
      row(3, 4, 11, hair);
      block(3, 3, 3, 9, hair);
      block(12, 3, 12, 9, hair);
      set(4, 4, hair);
      set(11, 4, hair);
    } else if (style === 'bun') {
      row(3, 4, 11, hair);
      block(6, 0, 9, 1, hair);
      set(5, 1, hair);
      set(10, 1, hair);
    }
  }

  /* -------------------------------------------------------------------- face */

  const brow = style === 'bald' ? shade(skin, 0.45) : hair;
  set(6, 5, brow);
  set(9, 5, brow);

  const eye = '#1a1a22';
  set(6, 6, eye);
  set(9, 6, eye);

  set(7, 7, shade(skin, 0.22));

  if (smiling) {
    row(9, 7, 8, shade(skin, 0.5));
    set(6, 8, shade(skin, 0.35));
    set(9, 8, shade(skin, 0.35));
  } else {
    row(9, 7, 8, shade(skin, 0.42));
  }

  if (beard) {
    row(10, 5, 10, shade(hair, 0.1));
    set(4, 9, shade(hair, 0.1));
    set(11, 9, shade(hair, 0.1));
    set(5, 9, shade(hair, 0.1));
    set(10, 9, shade(hair, 0.1));
  }

  if (glasses) {
    const frame = pick.from(['#1a1a22', '#8a8a8a', '#b8791a']);
    set(5, 6, frame);
    set(7, 6, frame);
    set(8, 6, frame);
    set(10, 6, frame);
    set(5, 5, frame);
    set(10, 5, frame);
  }

  return { size: SIZE, cells };
}

/**
 * Collapse the grid into horizontal runs.
 *
 * A 16x16 portrait is 256 cells, and a roster screen can show eight of them at once; 2,000 DOM
 * nodes for decoration is not a reasonable thing to ask a browser for. Runs typically cut it by
 * three quarters, and the output is still exact — this is a lossless encoding, not a
 * simplification.
 */
export function portraitRects(portrait: Portrait): PortraitRect[] {
  const rects: PortraitRect[] = [];
  const { size, cells } = portrait;

  for (let y = 0; y < size; y += 1) {
    let x = 0;
    while (x < size) {
      const fill = cells[y * size + x];
      if (fill === null || fill === undefined) {
        x += 1;
        continue;
      }
      let width = 1;
      while (x + width < size && cells[y * size + x + width] === fill) width += 1;
      rects.push({ x, y, width, fill });
      x += width;
    }
  }

  return rects;
}
