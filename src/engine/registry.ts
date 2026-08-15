/**
 * The content registry is the seam between the engine and the writing.
 *
 * The engine never imports from `src/content/`; it is handed a registry. That keeps the
 * simulation testable against small fixtures instead of the full corpus, and means content can
 * grow without the engine noticing.
 */

import type {
  Department,
  DepartmentId,
  GameEvent,
  Post,
  TaskTemplate,
  WorldBody,
} from './types';

export interface ContentRegistry {
  departments: Record<DepartmentId, Department>;
  /** Every post in the career graph, in no particular order. */
  posts: Post[];
  tasks: Record<string, TaskTemplate>;
  events: Record<string, GameEvent>;
  /** Names drawn on for new staff. Proper nouns, so literal strings rather than keys. */
  staffNames: string[];
  /** The public bodies that make up the country, which drift with or without the player. */
  bodies: WorldBody[];
}

export function getPost(registry: ContentRegistry, id: string): Post {
  const found = registry.posts.find((p) => p.id === id);
  if (!found) throw new Error(`No post defined for "${id}"`);
  return found;
}

/**
 * Where every career begins: the one post nothing leads to.
 *
 * Deriving it rather than naming a constant means the start moves when the content says it does,
 * and validation can insist there is exactly one.
 */
export function startingPost(registry: ContentRegistry): Post {
  const roots = registry.posts.filter((p) => p.from.length === 0);
  const first = roots[0];
  if (!first) throw new Error('No starting post: every post has an inbound edge');
  return first;
}

/** The posts reachable in one move from here, whatever the player's stats. */
export function postsFrom(registry: ContentRegistry, postId: string): Post[] {
  return registry.posts.filter((p) => p.from.some((edge) => edge.from === postId));
}

/**
 * The terms on which this particular move is available, or undefined if it is not.
 *
 * Deliberately tolerant of an unknown destination: callers ask "can I get there from here?" about
 * ids that may have been dropped from the content, and the answer to that is no rather than a
 * crash mid-career.
 */
export function edgeBetween(
  registry: ContentRegistry,
  fromId: string,
  toId: string,
): Post['from'][number] | undefined {
  const target = registry.posts.find((p) => p.id === toId);
  return target?.from.find((edge) => edge.from === fromId);
}

export function maxTier(registry: ContentRegistry): number {
  return registry.posts.reduce((max, p) => Math.max(max, p.tier), 1);
}

/** Every post at a tier, for the career screen's rows and for validation. */
export function postsAtTier(registry: ContentRegistry, tier: number): Post[] {
  return registry.posts.filter((p) => p.tier === tier);
}
