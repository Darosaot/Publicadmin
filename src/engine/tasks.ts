/**
 * The task board: spawning work, applying effort, scoring quality, and failing deadlines.
 *
 * These functions compute and return *what happened*, including the effect lists that should
 * follow. Applying those effects is `turn.ts`'s job, which keeps this module free of any
 * dependency on the effect machinery.
 */

import {
  QUALITY_BASE,
  QUALITY_DIFFICULTY_PENALTY,
  QUALITY_EARLY_BONUS_CAP,
  QUALITY_EARLY_BONUS_PER_TURN,
  QUALITY_EXCELLENT_THRESHOLD,
  QUALITY_GOOD_THRESHOLD,
  QUALITY_JITTER,
  QUALITY_OVERINVEST_BONUS_CAP,
  QUALITY_OVERINVEST_BONUS_PER_POINT,
  QUALITY_PERFORMANCE_WEIGHT,
  QUALITY_STRESS_THRESHOLD,
  QUALITY_STRESS_WEIGHT,
  TASK_EFFORT_LEVEL_SCALE,
  TASK_EFFORT_MULTIPLIER,
  REFERENCE_TASK_SLOTS,
} from './constants';
import { rigourEffortDelta, rigourQualityDelta } from './directives';
import { SCOPED_QUALITY_CAP } from './negotiate';
import { taskQualityBonus } from './perks';
import { getPost, type ContentRegistry } from './registry';
import { nextInt, nextRange, weightedPick } from './rng';
import type { ActiveTask, GameState, QualityTier, TaskTemplate } from './types';

/** Files get bigger as the post gets bigger. */
export function scaleEffort(baseEffort: number, level: number): number {
  const scaled =
    baseEffort * TASK_EFFORT_MULTIPLIER * (1 + TASK_EFFORT_LEVEL_SCALE * (level - 1));
  return Math.max(1, Math.round(scaled));
}

/** Adds one task to the board, rolling its deadline. Mutates nothing — returns a new state. */
export function spawnTask(state: GameState, template: TaskTemplate): GameState {
  const [minDeadline, maxDeadline] = template.deadlineRange;
  const roll = nextInt(state.rngState, minDeadline, maxDeadline);

  const task: ActiveTask = {
    uid: `t${state.nextTaskUid}`,
    templateId: template.id,
    progress: 0,
    // The rigour directive is priced in at spawn rather than at resolution, so the cost shows on
    // the card the player is looking at instead of arriving as a surprise at month end.
    required: Math.max(
      1,
      scaleEffort(template.baseEffort, state.player.level) + rigourEffortDelta(state),
    ),
    difficulty: template.difficulty,
    deadlineTurn: state.turn + roll.value,
    spawnedTurn: state.turn,
  };

  return {
    ...state,
    rngState: roll.rngState,
    nextTaskUid: state.nextTaskUid + 1,
    tasks: [...state.tasks, task],
  };
}

export function isTemplateEligible(
  template: TaskTemplate,
  state: GameState,
): boolean {
  if (template.departments !== 'any' && !template.departments.includes(state.player.department)) {
    return false;
  }
  if (template.minLevel !== undefined && state.player.level < template.minLevel) return false;
  if (template.maxLevel !== undefined && state.player.level > template.maxLevel) return false;
  return true;
}

/** Tops the board back up to the level's slot count. */
export function refillBoard(state: GameState, registry: ContentRegistry): GameState {
  const slots = getPost(registry, state.player.postId).taskSlots;
  let next = state;

  const allEligible = Object.values(registry.tasks).filter((t) => isTemplateEligible(t, next));
  if (allEligible.length === 0) return next;

  while (next.tasks.length < slots) {
    const active = new Set(next.tasks.map((t) => t.templateId));
    // Prefer work that isn't already on the desk, so the board reads as varied.
    const fresh = allEligible.filter((t) => !active.has(t.id));
    const pool = fresh.length > 0 ? fresh : allEligible;

    const roll = weightedPick(next.rngState, pool, (t) => t.weight);
    next = { ...next, rngState: roll.rngState };
    if (!roll.value) break;
    next = spawnTask(next, roll.value);
  }

  return next;
}

/* ------------------------------------------------------------- resolution */

export interface QualityRoll {
  score: number;
  tier: QualityTier;
  rngState: number;
}

export function tierForScore(score: number): QualityTier {
  if (score >= QUALITY_EXCELLENT_THRESHOLD) return 'excellent';
  if (score >= QUALITY_GOOD_THRESHOLD) return 'good';
  return 'poor';
}

/**
 * Scores a finished task. See `docs/game-design.md` §5 — this is that formula, verbatim.
 */
export function rollQuality(
  state: GameState,
  task: ActiveTask,
  /**
   * Ability behind the work, on the same 0–100 scale as Performance. Supplied when the file was
   * carried by a member of staff, so a delegated task is judged on their competence rather than
   * on the form of a manager who never opened it.
   */
  qualityBase?: number,
): QualityRoll {
  const earliness = Math.max(0, task.deadlineTurn - state.turn);
  const earlyBonus = Math.min(
    QUALITY_EARLY_BONUS_CAP,
    earliness * QUALITY_EARLY_BONUS_PER_TURN,
  );

  const overinvest = Math.max(0, task.progress - task.required);
  const overinvestBonus = Math.min(
    QUALITY_OVERINVEST_BONUS_CAP,
    overinvest * QUALITY_OVERINVEST_BONUS_PER_POINT,
  );

  const ability = qualityBase ?? state.stats.performance;
  const formBonus = (ability - 50) * QUALITY_PERFORMANCE_WEIGHT;
  const difficultyPenalty = (task.difficulty - 1) * QUALITY_DIFFICULTY_PENALTY;
  const stressPenalty =
    Math.max(0, state.stats.stress - QUALITY_STRESS_THRESHOLD) * QUALITY_STRESS_WEIGHT;

  const jitterRoll = nextRange(state.rngState, -QUALITY_JITTER, QUALITY_JITTER);

  const score =
    QUALITY_BASE +
    // An office that writes things down produces better work than one that does not, and pays
    // for it in the effort every file costs — see `spawnTask`.
    rigourQualityDelta(state) +
    taskQualityBonus(state) +
    earlyBonus +
    overinvestBonus +
    formBonus -
    difficultyPenalty -
    stressPenalty +
    jitterRoll.value;

  /*
   * A file cut back to what was actually needed cannot come back brilliant.
   *
   * Without this, scoping is free: the required effort falls, everything else is unchanged, and
   * the shortened file scores *better* because the early-delivery bonus grows. Part of what would
   * have made it excellent is precisely the part you agreed not to do.
   */
  const capped = task.scoped ? Math.min(score, SCOPED_QUALITY_CAP) : score;

  return {
    score: Math.round(capped),
    tier: tierForScore(capped),
    rngState: jitterRoll.rngState,
  };
}

/**
 * How much personal credit one finished file is worth at this level.
 *
 * Scaled down as the board grows, so that a month's total reputation movement stays comparable
 * across the career and the promotion thresholds keep meaning the same thing.
 */
export function creditScale(taskSlots: number): number {
  return REFERENCE_TASK_SLOTS / Math.max(1, taskSlots);
}

/** Applies that scale without letting an effect round away to nothing. */
export function scaleCredit(delta: number, scale: number): number {
  if (delta === 0) return 0;
  const scaled = delta * scale;
  return scaled < 0 ? Math.min(-1, Math.round(scaled)) : Math.max(1, Math.round(scaled));
}

/** A task is due once its deadline turn has arrived: finish it this month or it fails. */
export function isDue(task: ActiveTask, turn: number): boolean {
  return task.deadlineTurn <= turn;
}

export function isComplete(task: ActiveTask): boolean {
  return task.progress >= task.required;
}
