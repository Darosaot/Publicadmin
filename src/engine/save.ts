/**
 * Saving and loading.
 *
 * A save is just the serialised GameState, which works because the state holds content *ids*
 * rather than content objects, and because the RNG cursor is part of it. Loading a save resumes
 * the same random stream, so a run is fully reproducible.
 *
 * A save from a version with no migration path is rejected rather than guessed at. Migrations run
 * one version at a time, so each one only has to know about the single change it made.
 */

import { SAVE_VERSION } from './constants';
import { startingPost, type ContentRegistry } from './registry';
import type { GameState } from './types';

export const SAVE_KEY = 'padmin.save';

type RawSave = Record<string, unknown>;

/**
 * Version N -> N+1 transforms.
 *
 * Each one is handed the raw parsed save and returns it shaped for the next version. They run in
 * sequence, so a v1 save reaching a v4 build passes through all three.
 */
const MIGRATIONS: Record<number, (raw: RawSave) => RawSave> = {
  /**
   * 1 -> 2: the clock split in two.
   *
   * Before this, a turn was always one calendar month, so a v1 career's elapsed months are exactly
   * its turn count. Careers saved under the old clock therefore resume with a shorter history than
   * a new one would have by the same turn — which is correct: that is how long they had actually
   * been running.
   */
  1: (raw) => ({ ...raw, calendarMonth: typeof raw.turn === 'number' ? raw.turn : 0 }),

  /**
   * 2 -> 3: the ladder became a tree.
   *
   * Before this there was one post per level, so a v2 career's level maps to exactly one post —
   * the line-track one at that tier, which is the ladder it was climbing. Offers in flight are
   * remapped the same way; anything that cannot be mapped is dropped rather than guessed at,
   * which costs the player one offer and never a crash.
   */
  2: (raw) => {
    const player = (raw.player ?? {}) as Record<string, unknown>;
    const tier = typeof player.level === 'number' ? player.level : 1;
    const offers = Array.isArray(raw.offers) ? raw.offers : [];

    return {
      ...raw,
      player: {
        ...player,
        postId: LINE_TRACK_BY_TIER[tier] ?? LINE_TRACK_BY_TIER[1],
        track: 'line',
      },
      offers: offers.flatMap((raw_offer) => {
        const offer = raw_offer as Record<string, unknown>;
        const toTier = typeof offer.toLevel === 'number' ? offer.toLevel : undefined;
        const toPost = toTier === undefined ? undefined : LINE_TRACK_BY_TIER[toTier];
        if (!toPost || toTier === undefined) return [];
        const { toLevel: _dropped, ...rest } = offer;
        return [{ ...rest, toPost, toTier }];
      }),
    };
  },

  /**
   * 3 -> 4: the budget year became a year.
   *
   * `Budget.yearStartTurn` counted turns, which stopped meaning twelve months the moment a cycle
   * became six of them — a Director-General's budget year was six real years. It is now
   * `yearStartMonth`, against `calendarMonth`.
   *
   * There is no way to recover the calendar month an old budget year began, because the save never
   * recorded it. So the year restarts now: the player loses at most one verdict and never gets a
   * spurious one, which is the right way round.
   */
  3: (raw) => {
    if (!raw.budget || typeof raw.budget !== 'object') return raw;
    const { yearStartTurn: _dropped, ...budget } = raw.budget as Record<string, unknown>;
    const calendarMonth = typeof raw.calendarMonth === 'number' ? raw.calendarMonth : 0;
    return { ...raw, budget: { ...budget, yearStartMonth: calendarMonth } };
  },
};

/**
 * The line track, by tier — the ladder every pre-v3 career was on.
 *
 * Deliberately a literal rather than a lookup into the content: a migration has to keep working
 * when the content moves on, and reading today's posts to reconstruct yesterday's save is how
 * migrations rot.
 */
const LINE_TRACK_BY_TIER: Record<number, string> = {
  1: 'post.alderford.officer',
  2: 'post.northbridge.senior',
  3: 'post.region.head_of_unit',
  4: 'post.agency.head_of_department',
  5: 'post.ministry.director_general',
};

export function serialize(state: GameState): string {
  return JSON.stringify(state);
}

export type LoadResult =
  | { ok: true; state: GameState }
  | { ok: false; reason: 'empty' | 'corrupt' | 'incompatible' };

export function deserialize(json: string | null, registry: ContentRegistry): LoadResult {
  if (!json) return { ok: false, reason: 'empty' };

  let raw: RawSave;
  try {
    raw = JSON.parse(json) as RawSave;
  } catch {
    return { ok: false, reason: 'corrupt' };
  }

  if (typeof raw !== 'object' || raw === null) return { ok: false, reason: 'corrupt' };

  let version = typeof raw.saveVersion === 'number' ? raw.saveVersion : -1;
  if (version < 0) return { ok: false, reason: 'corrupt' };

  while (version < SAVE_VERSION) {
    const migrate = MIGRATIONS[version];
    if (!migrate) return { ok: false, reason: 'incompatible' };
    raw = migrate(raw);
    version += 1;
    raw.saveVersion = version;
  }
  if (version !== SAVE_VERSION) return { ok: false, reason: 'incompatible' };

  if (!hasRequiredShape(raw)) return { ok: false, reason: 'corrupt' };

  return { ok: true, state: pruneUnknownContent(raw as unknown as GameState, registry) };
}

function hasRequiredShape(raw: RawSave): boolean {
  const player = raw.player as Record<string, unknown> | undefined;
  return (
    typeof raw.turn === 'number' &&
    typeof raw.calendarMonth === 'number' &&
    typeof raw.rngState === 'number' &&
    typeof raw.phase === 'string' &&
    typeof raw.stats === 'object' &&
    raw.stats !== null &&
    Array.isArray(raw.tasks) &&
    typeof player === 'object' &&
    player !== null &&
    typeof player.department === 'string' &&
    typeof player.level === 'number' &&
    typeof player.postId === 'string' &&
    typeof player.track === 'string'
  );
}

/**
 * Drops references to content that no longer exists.
 *
 * Without this, deleting or renaming an event in a later release would break every save that
 * happened to have it queued.
 */
function pruneUnknownContent(state: GameState, registry: ContentRegistry): GameState {
  // A post that no longer exists would throw on the next lookup and take the career with it, so
  // an unrecognised one falls back to where careers start. Losing your post is a bad outcome; a
  // save that cannot be opened at all is a worse one.
  const known = registry.posts.some((p) => p.id === state.player.postId);
  const post = known ? undefined : startingPost(registry);

  return {
    ...state,
    player: post
      ? { ...state.player, postId: post.id, level: post.tier, track: post.track }
      : state.player,
    offers: state.offers.filter((o) => registry.posts.some((p) => p.id === o.toPost)),
    tasks: state.tasks.filter((t) => registry.tasks[t.templateId] !== undefined),
    pendingEvents: state.pendingEvents.filter((p) => registry.events[p.eventId] !== undefined),
    scheduledEvents: state.scheduledEvents.filter(
      (s) => registry.events[s.eventId] !== undefined,
    ),
  };
}

/* ------------------------------------------------------- browser storage */

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function storage(): StorageLike | undefined {
  try {
    if (typeof localStorage === 'undefined') return undefined;
    return localStorage;
  } catch {
    // Storage can throw outright in a locked-down browser context.
    return undefined;
  }
}

export function saveGame(state: GameState): void {
  try {
    storage()?.setItem(SAVE_KEY, serialize(state));
  } catch {
    // A full or disabled storage quota shouldn't crash a turn.
  }
}

export function loadGame(registry: ContentRegistry): LoadResult {
  const store = storage();
  if (!store) return { ok: false, reason: 'empty' };
  return deserialize(store.getItem(SAVE_KEY), registry);
}

export function clearSave(): void {
  try {
    storage()?.removeItem(SAVE_KEY);
  } catch {
    // Ignore.
  }
}

export function hasSave(): boolean {
  const store = storage();
  if (!store) return false;
  try {
    return store.getItem(SAVE_KEY) !== null;
  } catch {
    return false;
  }
}
