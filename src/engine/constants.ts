/**
 * Every balance number in the game.
 *
 * These mirror the tables in `docs/game-design.md`. When you tune one, update the doc — the design
 * document is meant to stay readable as the authority on *why* a number is what it is.
 */

import type { PlayerStats } from './types';

export const SAVE_VERSION = 1;

export const STAT_MIN = 0;
export const STAT_MAX = 100;

export const MAX_TURNS = 120;

export const STARTING_STATS: PlayerStats = {
  reputation: 20,
  performance: 50,
  politicalCapital: 10,
  integrity: 70,
  stress: 20,
};

/* ------------------------------------------------------------------ effort */

/** Extra points bought with overtime, and the stress they cost. */
export const OVERTIME_POINTS = 3;
export const OVERTIME_STRESS = 5;

export const REST_STRESS_RELIEF = 3;
export const NETWORK_PC_GAIN = 2;

/** The job weighs on you even in a quiet month. */
export const BASELINE_STRESS_PER_TURN = 2;

/* ------------------------------------------------------------------- tasks */

/** Required effort grows 12% per level: bigger post, bigger files. */
export const TASK_EFFORT_LEVEL_SCALE = 0.12;

export const QUALITY_BASE = 50;
export const QUALITY_EARLY_BONUS_PER_TURN = 6;
export const QUALITY_EARLY_BONUS_CAP = 18;
export const QUALITY_OVERINVEST_BONUS_PER_POINT = 4;
export const QUALITY_OVERINVEST_BONUS_CAP = 16;
export const QUALITY_PERFORMANCE_WEIGHT = 0.3;
export const QUALITY_DIFFICULTY_PENALTY = 10;
export const QUALITY_STRESS_THRESHOLD = 50;
export const QUALITY_STRESS_WEIGHT = 0.35;
export const QUALITY_JITTER = 12;

export const QUALITY_EXCELLENT_THRESHOLD = 75;
export const QUALITY_GOOD_THRESHOLD = 45;

export const TASK_QUALITY_EFFECTS = {
  excellent: { performance: 4, reputation: 3 },
  good: { performance: 2, reputation: 1 },
  poor: { performance: -2, reputation: -1 },
} as const;

export const TASK_FAILURE_EFFECTS = { performance: -5, reputation: -3 } as const;

/* ------------------------------------------------------------------ events */

/** One event is guaranteed each month; a second arrives this often. */
export const SECOND_EVENT_CHANCE = 0.35;
export const MAX_EVENTS_PER_TURN = 3;
export const RANDOM_EVENT_COOLDOWN = 12;

/* ------------------------------------------------------------------ career */

export const REVIEW_INTERVAL = 6;

/** Failing this many tasks between reviews drops your rating one band. */
export const REVIEW_FAILURE_PENALTY_THRESHOLD = 3;

export const REVIEW_OUTCOMES = {
  outstanding: { minPerformance: 75, reputation: 6, salaryPct: 0.03 },
  solid: { minPerformance: 55, reputation: 3, salaryPct: 0.015 },
  adequate: { minPerformance: 40, reputation: 0, salaryPct: 0 },
  concerning: { minPerformance: 0, reputation: -5, salaryPct: 0 },
} as const;

export const OFFER_BASE_CHANCE = 0.35;
export const OFFER_CHANCE_PER_REPUTATION_POINT = 0.01;
export const OFFER_MAX_CHANCE = 0.8;
export const OFFER_EXPIRY_TURNS = 3;
/** Offered salary jitters a little around the level's baseline. */
export const OFFER_SALARY_VARIANCE = 0.06;

/* ---------------------------------------------------------------- endings */

export const BURNOUT_STRESS = 100;
export const DISGRACE_INTEGRITY = 0;
export const DISMISSAL_REPUTATION = 10;
export const DISMISSAL_PERFORMANCE = 25;
export const HONOURED_RETIREMENT_REPUTATION = 60;

/** Requirements for the Minister confirmation arc to begin, from level 5. */
export const MINISTER_MIN_REPUTATION = 88;
export const MINISTER_MIN_POLITICAL_CAPITAL = 70;

/* -------------------------------------------------------------------- misc */

export const LOG_LIMIT = 60;
