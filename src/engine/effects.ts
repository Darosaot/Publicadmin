/**
 * Applying effects to the game state, and evaluating the conditions that gate content.
 *
 * Every mutation of stats in the whole game funnels through `applyEffects`, which is the only
 * place that knows stats are clamped to 0–100.
 */

import { STAT_MAX, STAT_MIN } from './constants';
import type { ContentRegistry } from './registry';
import { spawnTask } from './tasks';
import type { Condition, Effect, GameState, PlayerStats, StatId } from './types';

/** Structural clone of the state. Cheap enough at this size, and keeps the engine honest. */
export function cloneState(state: GameState): GameState {
  return {
    ...state,
    player: { ...state.player },
    stats: { ...state.stats },
    tasks: state.tasks.map((t) => ({ ...t })),
    pendingEvents: state.pendingEvents.map((p) => ({
      ...p,
      resolution: p.resolution ? { ...p.resolution } : undefined,
    })),
    scheduledEvents: state.scheduledEvents.map((s) => ({ ...s })),
    firedEvents: [...state.firedEvents],
    cooldowns: { ...state.cooldowns },
    flags: { ...state.flags },
    offers: state.offers.map((o) => ({ ...o })),
    sinceReview: { ...state.sinceReview },
    log: state.log.map((l) => ({ ...l })),
    lastReport: state.lastReport ? { ...state.lastReport } : undefined,
  };
}

export function clampStat(value: number): number {
  return Math.max(STAT_MIN, Math.min(STAT_MAX, Math.round(value)));
}

/** Applies a single stat change in place, clamped. */
export function adjustStat(stats: PlayerStats, stat: StatId, delta: number): void {
  stats[stat] = clampStat(stats[stat] + delta);
}

/**
 * Applies a list of effects, returning a new state.
 *
 * An `endGame` effect short-circuits: nothing after it in the list is applied, because the career
 * is over and further bookkeeping would be noise.
 */
export function applyEffects(
  state: GameState,
  effects: readonly Effect[],
  registry: ContentRegistry,
): GameState {
  let next = cloneState(state);

  for (const effect of effects) {
    switch (effect.kind) {
      case 'stat':
        adjustStat(next.stats, effect.stat, effect.delta);
        break;

      case 'salary':
        next.player.salary = Math.max(0, Math.round(next.player.salary + effect.delta));
        break;

      case 'flag':
        next.flags[effect.flag] = effect.value ?? true;
        break;

      case 'spawnTask': {
        const template = registry.tasks[effect.templateId];
        if (template) next = spawnTask(next, template);
        break;
      }

      case 'queueEvent': {
        const delay = effect.delayTurns ?? 0;
        next.scheduledEvents.push({
          eventId: effect.eventId,
          onTurn: next.turn + Math.max(0, delay),
        });
        break;
      }

      case 'endGame':
        next.ending = effect.ending;
        next.phase = 'ended';
        return next;
    }
  }

  return next;
}

/** Diff two stat blocks, keeping only the entries that actually moved. */
export function statDeltas(before: PlayerStats, after: PlayerStats): Partial<PlayerStats> {
  const deltas: Partial<PlayerStats> = {};
  for (const key of Object.keys(after) as StatId[]) {
    const delta = after[key] - before[key];
    if (delta !== 0) deltas[key] = delta;
  }
  return deltas;
}

/* -------------------------------------------------------------- conditions */

/** Why a condition failed, so the UI can tell the player what they're missing. */
export interface ConditionFailure {
  reason: 'level' | 'department' | 'turn' | 'stat' | 'salary' | 'flag';
  stat?: StatId;
  required?: number;
  comparison?: 'min' | 'max';
}

export function checkCondition(
  state: GameState,
  condition: Condition | undefined,
): ConditionFailure | undefined {
  if (!condition) return undefined;

  const { player, stats, turn, flags } = state;

  if (condition.minLevel !== undefined && player.level < condition.minLevel) {
    return { reason: 'level', required: condition.minLevel, comparison: 'min' };
  }
  if (condition.maxLevel !== undefined && player.level > condition.maxLevel) {
    return { reason: 'level', required: condition.maxLevel, comparison: 'max' };
  }
  if (condition.departments && !condition.departments.includes(player.department)) {
    return { reason: 'department' };
  }
  if (condition.minTurn !== undefined && turn < condition.minTurn) {
    return { reason: 'turn', required: condition.minTurn, comparison: 'min' };
  }
  if (condition.minSalary !== undefined && player.salary < condition.minSalary) {
    return { reason: 'salary', required: condition.minSalary, comparison: 'min' };
  }

  if (condition.minStat) {
    for (const [stat, required] of Object.entries(condition.minStat) as [StatId, number][]) {
      if (stats[stat] < required) {
        return { reason: 'stat', stat, required, comparison: 'min' };
      }
    }
  }
  if (condition.maxStat) {
    for (const [stat, required] of Object.entries(condition.maxStat) as [StatId, number][]) {
      if (stats[stat] > required) {
        return { reason: 'stat', stat, required, comparison: 'max' };
      }
    }
  }

  if (condition.requiredFlags) {
    for (const flag of condition.requiredFlags) {
      if (!flags[flag]) return { reason: 'flag' };
    }
  }
  if (condition.forbiddenFlags) {
    for (const flag of condition.forbiddenFlags) {
      if (flags[flag]) return { reason: 'flag' };
    }
  }

  return undefined;
}

export function conditionMet(state: GameState, condition: Condition | undefined): boolean {
  return checkCondition(state, condition) === undefined;
}
