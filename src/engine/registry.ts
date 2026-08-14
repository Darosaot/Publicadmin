/**
 * The content registry is the seam between the engine and the writing.
 *
 * The engine never imports from `src/content/`; it is handed a registry. That keeps the
 * simulation testable against small fixtures instead of the full 80-event corpus, and means
 * content can grow without the engine noticing.
 */

import type { CareerLevel, Department, DepartmentId, GameEvent, TaskTemplate } from './types';

export interface ContentRegistry {
  departments: Record<DepartmentId, Department>;
  /** Ordered from level 1 upward. */
  careerLevels: CareerLevel[];
  tasks: Record<string, TaskTemplate>;
  events: Record<string, GameEvent>;
}

export function getCareerLevel(registry: ContentRegistry, level: number): CareerLevel {
  const found = registry.careerLevels.find((l) => l.level === level);
  if (!found) throw new Error(`No career level defined for level ${level}`);
  return found;
}

export function maxCareerLevel(registry: ContentRegistry): number {
  return registry.careerLevels.reduce((max, l) => Math.max(max, l.level), 1);
}
