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
import type { ContentRegistry } from './registry';
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
    typeof player.level === 'number'
  );
}

/**
 * Drops references to content that no longer exists.
 *
 * Without this, deleting or renaming an event in a later release would break every save that
 * happened to have it queued.
 */
function pruneUnknownContent(state: GameState, registry: ContentRegistry): GameState {
  return {
    ...state,
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
