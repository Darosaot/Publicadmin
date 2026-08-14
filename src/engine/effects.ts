/**
 * Applying effects to the game state, and evaluating the conditions that gate content.
 *
 * Every mutation of stats in the whole game funnels through `applyEffects`, which is the only
 * place that knows stats are clamped to 0–100.
 */

import { yearsElapsed } from './calendar';
import { STAT_MAX, STAT_MIN } from './constants';
import type { ContentRegistry } from './registry';
import { spawnTask } from './tasks';
import { adjustTeamMorale, averageMorale, createStaff } from './team';
import type { Condition, Effect, GameState, PlayerStats, StatId } from './types';

/**
 * A flag read as a number.
 *
 * Flags started out boolean and some of them grew into quantities. An unset flag is 0, and a
 * boolean one is 0 or 1, so a numeric read of any flag is always meaningful.
 */
export function flagValue(state: GameState, flag: string): number {
  const raw = state.flags[flag];
  if (typeof raw === 'number') return raw;
  return raw ? 1 : 0;
}

/** Structural clone of the state. Cheap enough at this size, and keeps the engine honest. */
export function cloneState(state: GameState): GameState {
  return {
    ...state,
    player: { ...state.player },
    stats: { ...state.stats },
    tasks: state.tasks.map((t) => ({ ...t })),
    staff: state.staff.map((s) => ({ ...s })),
    hiring: state.hiring ? { ...state.hiring } : undefined,
    budget: state.budget ? { ...state.budget } : undefined,
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

      case 'flagDelta':
        next.flags[effect.flag] = flagValue(next, effect.flag) + effect.delta;
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

      case 'teamMorale':
        next = adjustTeamMorale(next, effect.delta);
        break;

      case 'teamSkill':
        next = {
          ...next,
          staff: next.staff.map((member) => ({
            ...member,
            skill: clampStat(member.skill + effect.delta),
          })),
        };
        break;

      case 'budget':
        if (next.budget) {
          next.budget = { ...next.budget, balance: next.budget.balance + effect.delta };
        }
        break;

      case 'budgetMonthly':
        if (next.budget) {
          next.budget = {
            ...next.budget,
            monthly: Math.max(0, next.budget.monthly + effect.delta),
          };
        }
        break;

      case 'loseStaff': {
        // The least engaged person is the one who goes; that is usually how it happens.
        if (next.staff.length > 0) {
          const leaver = [...next.staff].sort((a, b) => a.morale - b.morale)[0]!;
          next = {
            ...next,
            staff: next.staff.filter((s) => s.id !== leaver.id),
            tasks: next.tasks.map((task) =>
              task.assignedTo === leaver.id ? { ...task, assignedTo: undefined } : task,
            ),
          };
        }
        break;
      }

      case 'gainStaff': {
        const made = createStaff(next, registry, effect.seniority);
        next = { ...made.state, staff: [...made.state.staff, made.staff] };
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
  reason: 'level' | 'department' | 'track' | 'turn' | 'stat' | 'salary' | 'flag' | 'team';
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
  if (condition.tracks && !condition.tracks.includes(player.track)) {
    return { reason: 'track' };
  }
  if (condition.minTurn !== undefined && turn < condition.minTurn) {
    return { reason: 'turn', required: condition.minTurn, comparison: 'min' };
  }
  if (condition.minYearsElapsed !== undefined && yearsElapsed(state) < condition.minYearsElapsed) {
    return { reason: 'turn', required: condition.minYearsElapsed, comparison: 'min' };
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

  if (condition.requiresTeam !== undefined) {
    const managing = state.staff.length > 0 || (state.budget?.monthly ?? 0) > 0;
    if (condition.requiresTeam !== managing) return { reason: 'team' };
  }
  if (condition.minStaffCount !== undefined && state.staff.length < condition.minStaffCount) {
    return { reason: 'team' };
  }
  if (condition.minTeamMorale !== undefined || condition.maxTeamMorale !== undefined) {
    const morale = averageMorale(state);
    if (condition.minTeamMorale !== undefined && morale < condition.minTeamMorale) {
      return { reason: 'team' };
    }
    if (condition.maxTeamMorale !== undefined && morale > condition.maxTeamMorale) {
      return { reason: 'team' };
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
  if (condition.minFlag) {
    for (const [flag, required] of Object.entries(condition.minFlag)) {
      if (flagValue(state, flag) < required) return { reason: 'flag' };
    }
  }
  if (condition.maxFlag) {
    for (const [flag, limit] of Object.entries(condition.maxFlag)) {
      if (flagValue(state, flag) > limit) return { reason: 'flag' };
    }
  }

  return undefined;
}

export function conditionMet(state: GameState, condition: Condition | undefined): boolean {
  return checkCondition(state, condition) === undefined;
}
