/**
 * Seeded pseudo-random number generation.
 *
 * The generator's cursor lives inside GameState, not in a module-level variable, so a save file
 * captures the exact position in the random stream. Reload a save and the future unfolds the same
 * way it would have. Tests pin a seed and assert exact results.
 *
 * Every function here takes the cursor and returns the next one alongside the value, so nothing
 * in the engine is allowed to be quietly stateful.
 */

export interface Roll<T> {
  value: T;
  rngState: number;
}

/** mulberry32 — small, fast, and good enough for a game about paperwork. */
export function nextFloat(rngState: number): Roll<number> {
  let t = (rngState + 0x6d2b79f5) | 0;
  let r = t;
  r = Math.imul(r ^ (r >>> 15), r | 1);
  r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
  const value = ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  return { value, rngState: t };
}

/** Integer in [min, max], inclusive. */
export function nextInt(rngState: number, min: number, max: number): Roll<number> {
  const roll = nextFloat(rngState);
  const span = max - min + 1;
  return { value: min + Math.floor(roll.value * span), rngState: roll.rngState };
}

/** Float in [min, max). */
export function nextRange(rngState: number, min: number, max: number): Roll<number> {
  const roll = nextFloat(rngState);
  return { value: min + roll.value * (max - min), rngState: roll.rngState };
}

/** True with the given probability. */
export function nextChance(rngState: number, probability: number): Roll<boolean> {
  const roll = nextFloat(rngState);
  return { value: roll.value < probability, rngState: roll.rngState };
}

/** Uniform pick from a non-empty array. Returns undefined only for an empty array. */
export function pick<T>(rngState: number, items: readonly T[]): Roll<T | undefined> {
  if (items.length === 0) return { value: undefined, rngState };
  const roll = nextInt(rngState, 0, items.length - 1);
  return { value: items[roll.value], rngState: roll.rngState };
}

/**
 * Weighted pick. Items with a non-positive weight are never selected.
 * Returns undefined if the list is empty or every weight is non-positive.
 */
export function weightedPick<T>(
  rngState: number,
  items: readonly T[],
  weightOf: (item: T) => number,
): Roll<T | undefined> {
  let total = 0;
  for (const item of items) {
    const w = weightOf(item);
    if (w > 0) total += w;
  }
  if (total <= 0) return { value: undefined, rngState };

  const roll = nextRange(rngState, 0, total);
  let cursor = roll.value;
  for (const item of items) {
    const w = weightOf(item);
    if (w <= 0) continue;
    cursor -= w;
    if (cursor < 0) return { value: item, rngState: roll.rngState };
  }
  // Floating-point drift: fall back to the last eligible item.
  const eligible = items.filter((i) => weightOf(i) > 0);
  return { value: eligible[eligible.length - 1], rngState: roll.rngState };
}

/**
 * Weighted pick of up to `count` distinct items, without replacement.
 * Used to draw a turn's events in one deterministic pass.
 */
export function weightedSample<T>(
  rngState: number,
  items: readonly T[],
  weightOf: (item: T) => number,
  count: number,
): Roll<T[]> {
  const remaining = [...items];
  const chosen: T[] = [];
  let state = rngState;

  while (chosen.length < count && remaining.length > 0) {
    const roll = weightedPick(state, remaining, weightOf);
    state = roll.rngState;
    if (roll.value === undefined) break;
    chosen.push(roll.value);
    remaining.splice(remaining.indexOf(roll.value), 1);
  }

  return { value: chosen, rngState: state };
}

/** Derive a starting cursor from a seed. Keeps low seeds (1, 2, 3…) from behaving alike. */
export function seedToState(seed: number): number {
  let h = seed | 0;
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) | 0;
}
