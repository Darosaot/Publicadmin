/**
 * Every balance number in the game.
 *
 * These mirror the tables in `docs/game-design.md`. When you tune one, update the doc — the design
 * document is meant to stay readable as the authority on *why* a number is what it is.
 */

import type { PlayerStats } from './types';

export const SAVE_VERSION = 7;

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

/* ------------------------------------------------------------------ drift */

/**
 * Monthly drift, and the reason the stats mean anything.
 *
 * Without it every stat is a ratchet: a career completes a hundred files, each worth a point or
 * three of Reputation, and by year five everyone is on 100 regardless of how they played. Decay
 * turns Reputation and Political Capital into a measure of how you are doing *lately* — they
 * settle at whatever level your current work and current allies sustain — which is what makes
 * the promotion thresholds mean something.
 *
 * Performance reverts toward the middle instead of decaying, in both directions: a great year
 * fades, and a terrible one recovers rather than spiralling.
 *
 * Integrity is deliberately exempt. A record does not fade.
 */
export const REPUTATION_DECAY_RATE = 0.046;
export const POLITICAL_CAPITAL_DECAY_RATE = 0.044;
export const PERFORMANCE_REVERSION_RATE = 0.05;
export const PERFORMANCE_BASELINE = 50;

/* ------------------------------------------------------------------- tasks */

/**
 * How much work a desk actually holds.
 *
 * The multiplier sets the ratio between what the board demands each month and what a level's
 * effort points supply. It is deliberately above 1: a player who can finish everything is never
 * choosing anything, and choosing is the game. Tune it with `npm run balance`.
 */
export const TASK_EFFORT_MULTIPLIER = 1.35;

/** On top of that, files get bigger with the post. Slots grow too, so this stays gentle. */
export const TASK_EFFORT_LEVEL_SCALE = 0.08;

/**
 * The baseline is set so that finishing an average file on time, with exactly the effort it
 * needed, is solid work rather than poor work. Earliness and extra care are what push it to
 * excellent. Getting this wrong in the other direction produces a death spiral: poor work lowers
 * Performance, which lowers quality, which produces more poor work.
 */
export const QUALITY_BASE = 58;
export const QUALITY_EARLY_BONUS_PER_TURN = 6;
export const QUALITY_EARLY_BONUS_CAP = 18;
export const QUALITY_OVERINVEST_BONUS_PER_POINT = 4;
export const QUALITY_OVERINVEST_BONUS_CAP = 16;
/** Kept low deliberately — it is the feedback term, and a strong one oscillates. */
export const QUALITY_PERFORMANCE_WEIGHT = 0.2;
export const QUALITY_DIFFICULTY_PENALTY = 7;
export const QUALITY_STRESS_THRESHOLD = 50;
export const QUALITY_STRESS_WEIGHT = 0.35;
export const QUALITY_JITTER = 12;

export const QUALITY_EXCELLENT_THRESHOLD = 75;
export const QUALITY_GOOD_THRESHOLD = 45;

/**
 * The board a level-1 officer works, used as the reference for per-file credit.
 *
 * A director's standing is not the sum of forty files; it is the record of the unit. Without
 * this, reputation income grows with the size of the board and every senior career saturates at
 * 100 regardless of how it was played — which is precisely what the balance run showed once
 * delegation let a manager finish eight files a month.
 */
export const REFERENCE_TASK_SLOTS = 4;

export const TASK_QUALITY_EFFECTS = {
  excellent: { performance: 4, reputation: 3 },
  good: { performance: 2, reputation: 1 },
  poor: { performance: -2, reputation: -1 },
} as const;

/**
 * The board is deliberately oversubscribed, so missing something occasionally is the normal
 * texture of the job rather than a punishment. The real sting is in the consequence events a
 * missed deadline schedules.
 */
export const TASK_FAILURE_EFFECTS = { performance: -3, reputation: -2 } as const;

/* ------------------------------------------------------- staff and budget */

/**
 * The unit.
 *
 * The economics are meant to make delegation genuinely attractive rather than a formality: a
 * capable, well-treated officer out-produces the effort point you spend briefing them, and a
 * demoralised one does not. That is the whole management game — you are not doing the work any
 * more, you are deciding who does it and whether they are in a state to.
 */

/** Effort points it costs to hand a file over, coach someone, or sit down with them. */
export const DELEGATION_EFFORT_COST = 1;
export const COACHING_EFFORT_COST = 2;
export const ONE_TO_ONE_EFFORT_COST = 1;
export const RECRUITING_EFFORT_COST = 2;

/**
 * How many files one person can carry at once.
 *
 * A senior can hold two and a junior one, and a person's monthly output is *divided* between what
 * they hold rather than paid in full to each. Both halves matter: without the cap you could put
 * one senior on the whole board, and without the division doing so was free output.
 *
 * The trade is real either way — two files from one senior progress at half speed each, which is
 * sometimes exactly what a pair of deadlines needs.
 */
export const DELEGATION_CAPACITY: Record<'junior' | 'officer' | 'senior', number> = {
  junior: 1,
  officer: 1,
  senior: 2,
};

/**
 * How far an entirely neglected institution can fall on its own.
 *
 * Drift was calibrated per month and never checked against a career. At -0.09 a month Eastmoor
 * went from 34 to 4 over twenty-eight years — total collapse, arriving whatever the player did —
 * while the three-stage chain written to rescue it tops out at +23. The content and the numbers
 * were telling opposite stories.
 *
 * The fix is not mean reversion, which was considered and rejected for good reasons: a mark that
 * fades is a mark you did not make. Decay instead *decelerates* as a body approaches this floor,
 * because a place that is already badly run has less left to lose. Neglect still ruins somewhere;
 * it no longer annihilates it, and a player's work stays visible against it.
 */
export const DRIFT_FLOOR = 20;

/**
 * How many former colleagues a career remembers.
 *
 * Twelve, and the oldest is dropped. Not a simulation limit — a save-size one, and roughly the
 * number of people from a thirty-year career whose name a player could actually place.
 */
export const ALUMNI_LIMIT = 12;

/**
 * How often a new officer's field is the one you work in.
 *
 * Uniform across seven departments, a unit of four almost never held a specialist for its own
 * board — the sweep put the bonus on eight per cent of files, which is a decoration rather than a
 * decision. Somewhat under half keeps the unit a mix while making "who is actually best at this
 * one" a question worth asking most months.
 */
export const SPECIALIST_HIRE_CHANCE = 0.45;

/** How many of your unit you may take with you when you take a new post. */
export const KEEP_ON_MOVE_LIMIT = 2;

/* ------------------------------------------------------------- initiatives */

/**
 * How many cycles an initiative survives with nothing put into it.
 *
 * Three, so a single month of firefighting never kills one, and forgetting about it for a year
 * always does. This is the whole cost of starting something: not money, not effort, but having
 * to keep coming back to it while the board keeps refilling.
 */
export const INITIATIVE_LAPSE_CYCLES = 3;

/**
 * How many may be in flight at once, by tier.
 *
 * One until you run a unit, two after. A second slot is the actual reward for seniority here —
 * more effort points only buy more of the same month, whereas a second initiative buys a second
 * thing you are trying to change.
 */
export const INITIATIVE_SLOTS_BASE = 1;
export const INITIATIVE_SLOTS_SENIOR = 2;
export const INITIATIVE_SLOTS_SENIOR_TIER = 3;

/** Monthly output by grade, before skill and morale are applied. */
export const STAFF_BASE_OUTPUT: Record<'junior' | 'officer' | 'senior', number> = {
  junior: 3,
  officer: 5,
  senior: 7,
};

export const STAFF_SALARY: Record<'junior' | 'officer' | 'senior', number> = {
  junior: 1800,
  officer: 2600,
  senior: 3600,
};

/** Starting ranges when a person is generated. */
export const STAFF_START_SKILL: Record<'junior' | 'officer' | 'senior', [number, number]> = {
  junior: [20, 45],
  officer: [40, 70],
  senior: [60, 88],
};
export const STAFF_START_MORALE: [number, number] = [50, 75];

/** Nobody stays motivated by default. */
export const STAFF_MORALE_DRIFT = -1;
export const ONE_TO_ONE_MORALE_GAIN = 9;
export const COACHING_SKILL_GAIN = 4;

/**
 * The skill at which somebody is plainly doing the next grade's job already.
 *
 * Promotion from within is free — it costs the budget the difference in salary and nothing else —
 * because that is what it costs in reality, and because the alternative to noticing is the entry
 * below.
 */
export const PROMOTION_SKILL: Record<'junior' | 'officer', number> = {
  junior: 74,
  officer: 88,
};

/**
 * When somebody good starts looking, and how often it works.
 *
 * Deliberately keyed off high skill and *low* morale together: your best people are the ones with
 * somewhere else to go, and the only thing keeping them is whether the job is worth having. This
 * is the departure reason `TeamReport` has declared since the office landed and nothing has ever
 * produced.
 */
export const POACHING_SKILL = 74;
export const POACHING_MORALE = 55;
export const POACHING_CHANCE = 0.06;
export const COACHING_MORALE_GAIN = 3;
export const TRAINING_SKILL_GAIN = 6;
export const TRAINING_COST = 1500;

/** Experience alone teaches a little, slowly. */
export const STAFF_SKILL_DRIFT_PER_YEAR = 2;

/** What a delegated file that fails does to the person who was carrying it. */
export const STAFF_MORALE_ON_TASK_FAILURE = -6;
export const STAFF_MORALE_ON_TASK_EXCELLENT = 4;

/** Below this, people start looking. */
export const STAFF_ATTRITION_MORALE = 30;
export const STAFF_ATTRITION_CHANCE = 0.18;

export const HIRING_MONTHS: Record<'junior' | 'officer' | 'senior', number> = {
  junior: 2,
  officer: 3,
  senior: 4,
};

/** Agency cover: money for effort, at a poor exchange rate. */
export const AGENCY_TEMP_COST = 3200;
export const AGENCY_TEMP_EFFORT = 2;
export const AGENCY_TEMP_MAX = 3;

/** The budget year is judged as a whole, and both directions of failure cost you. */
export const BUDGET_YEAR_MONTHS = 12;
export const BUDGET_OVERSPEND_TOLERANCE = 0.04;
export const BUDGET_UNDERSPEND_TOLERANCE = 0.12;
export const BUDGET_OVERSPEND_REPUTATION = -6;
export const BUDGET_UNDERSPEND_REPUTATION = -3;
/** An underspent budget is a smaller budget next year. */
export const BUDGET_UNDERSPEND_CUT = 0.1;

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
/** Not zero: a record this bad has already ended the career, and waiting for 0 never fires. */
export const DISGRACE_INTEGRITY = 8;
export const DISMISSAL_REPUTATION = 10;
export const DISMISSAL_PERFORMANCE = 25;
export const HONOURED_RETIREMENT_REPUTATION = 60;

/** Requirements for the Minister confirmation arc to begin, from level 5. */
export const MINISTER_MIN_REPUTATION = 88;
export const MINISTER_MIN_POLITICAL_CAPITAL = 70;

/* -------------------------------------------------------------------- misc */

export const LOG_LIMIT = 60;
