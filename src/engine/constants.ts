/**
 * Every balance number in the game.
 *
 * These mirror the tables in `docs/game-design.md`. When you tune one, update the doc — the design
 * document is meant to stay readable as the authority on *why* a number is what it is.
 */

import type { PlayerStats } from './types';

export const SAVE_VERSION = 8;

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

/* ---------------------------------------------------------------- pushing back */

/**
 * What it costs to argue about a file, in favours owed.
 *
 * Refusing is dearest and is the only one that also costs standing, because it is the only one
 * anybody outside the conversation hears about. Moving a date is priced dynamically on how much
 * of the file is left — see `negotiationCost`.
 */
export const SCOPE_PC_COST = 9;
export const REFUSE_PC_COST = 14;
export const REFUSE_REPUTATION_COST = 4;

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

/* ------------------------------------------------------------------ rival */

/**
 * Elena Vásquez's numbers.
 *
 * She is tuned to be a pacer rather than an opponent. A rival who always wins is a taunt and a
 * rival who always loses is furniture; the sweep asserts her final tier spreads across the range
 * rather than piling at either end, and these are the numbers that keep it there.
 */

/** She starts where you start, because she started the week you did. */
export const RIVAL_STARTING_STANDING = 20;

/**
 * How good she turns out to be, rolled once per career and never moved.
 *
 * The band is deliberately wide. On a low roll you outgrow her by year ten and the late scenes
 * are about what that does to somebody; on a high roll she is your director and they are about
 * what that does to you. Both are worth playing and neither should be the only one you ever see.
 */
export const RIVAL_CEILING_MIN = 48;
export const RIVAL_CEILING_MAX = 81;

/**
 * How long she has to have been somewhere before she is a plausible appointment elsewhere.
 *
 * Only used when she picks up a post the player let go. Her ordinary progression is held to the
 * `minTurnsAtLevel` written on the edge, like everyone else's.
 */
export const RIVAL_MIN_MONTHS_TO_MOVE = 10;

/** Fraction of the distance to her ceiling that she closes each cycle. */
export const RIVAL_STANDING_DRIFT = 0.055;

/** A new post knocks anybody back. You arrive one post short; so does she. */
export const RIVAL_STANDING_ON_PROMOTION = -14;

/**
 * Her chance of taking any one edge she qualifies for, per cycle.
 *
 * Below the player's `OFFER_BASE_CHANCE` on purpose: she is walking the same graph without a
 * player's attention on it, and a rival who is promoted faster than you can be while playing well
 * reads as the game cheating rather than as a career.
 */
export const RIVAL_OFFER_CHANCE = 0.26;

/**
 * How long a post she took is closed to you.
 *
 * The mechanic that finally gives offer expiry teeth: before this, an offer lapsing cost nothing
 * whatsoever. A cooldown rather than a permanent closure, because permanent is a much harsher
 * game than the one these constants are tuned for — the sweep shows it immediately as a collapse
 * in mean level.
 */
export const RIVAL_HOLDS_POST_TURNS = 10;

/**
 * When she gives up on it, and how likely that is each cycle once she has.
 *
 * Written twice before it was right, and the second version is the interesting failure. It asked
 * whether her standing had fallen below a threshold — but her standing climbs toward a ceiling of
 * at least 48 and the only thing that knocks it down is a promotion, so after the qualifying
 * period nobody could ever be below the bar. Zero rivals resigned across eighty-four careers.
 * Unreachable content is the failure this codebase has documented more than any other, and a
 * mechanic that cannot fire is the same thing as one that does not exist.
 *
 * **People do not leave a public administration because their standing dipped. They leave because
 * it stopped going anywhere.** So it is a stall: a decade in the same post, still near the bottom
 * of the tree. That is reachable — a ceiling under the tier-3 bar means exactly this career — and
 * it is the true reason, which is usually where these end up.
 */
export const RIVAL_STALL_MONTHS = 120;
export const RIVAL_STALL_LEVEL = 2;
export const RIVAL_RESIGN_CHANCE = 0.06;

/** Set on the state when she goes, so content can gate on it rather than assuming. */
export const RIVAL_GONE_FLAG = 'rival_gone';

/* ------------------------------------------------------------------ money */

/**
 * Savings, and the rule that keeps them from becoming a second reputation.
 *
 * Money buys **options and relief**; its absence buys **pressure**. It must never buy standing or
 * promotion velocity, which is the same rule perks and initiatives already follow and for the same
 * reason: offers key off reputation, so anything paying reputation converts a hoarded resource
 * straight into promotion speed and every career converges on one build. `validate.ts` enforces
 * it on content.
 */
export const MONEY_NEVER_BUYS_REPUTATION = true;

export const STARTING_SAVINGS = 1400;

/**
 * What living costs, as a fraction of the post's baseline salary.
 *
 * Scaled to the post rather than fixed, because the career moves you to a bigger place every time
 * it promotes you and the rent goes with it. Holding it fixed would have made seniority a money
 * printer and the whole system trivial by tier three.
 */
export const OUTGOINGS_OF_BASE_SALARY = 0.72;

/** Hardship: below this you are short, and it costs you every cycle until you are not. */
export const HARDSHIP_SAVINGS = 0;
export const HARDSHIP_STRESS_PER_CYCLE = 2;

/**
 * Above this you have a cushion — and it buys you nothing on the stats bar, deliberately.
 *
 * The first version gave comfort a permanent point of stress relief, which the sweep caught
 * immediately: a competent career clears this threshold by its second post and then holds it for
 * twenty-five years, so the "relief" was a flat upgrade with no downside. Worse, it laundered
 * itself into promotion velocity through the sink documented in §8j — less stress means less
 * resting, the freed points go on the board, and the career came out five points of reputation
 * ahead. That is money buying standing by another route, which is the one thing money may never
 * do.
 *
 * So comfort is a **state content can gate on**, not a bonus. It decides which choices are open
 * to you. What it must never do is quietly make you better at the job.
 */
export const COMFORT_SAVINGS = 45_000;

/* ---------------------------------------------------------------- climate */

export const CLIMATE_MIN = -100;
export const CLIMATE_MAX = 100;

/**
 * How fast each dial returns to nothing in particular.
 *
 * Mean reversion is not decoration here, it is the guardrail. A dial with a net drift is not
 * weather — it is a difficulty setting applied to every other guardrail at once, and they would
 * move with it rather than catching it. A career's mean climate has to come out near zero, and
 * there is a test that says so.
 */
export const CLIMATE_REVERSION_RATE = 0.055;

/** How hard the dials are pushed each month, before reversion pulls back. */
export const CLIMATE_SHOCK_MAX = 4;

/** A term of government, in calendar months, and how much of it the campaign occupies. */
export const ELECTION_TERM_MONTHS = 48;

/**
 * What a change of government does to the dials.
 *
 * The fiscal swing is symmetric, so a new government is as likely to open the taps as to close
 * them. Trust is **reset toward nothing rather than bounced upward**, and that is a correction
 * rather than a preference: the first version gave every new administration +12 and, at 7.6
 * elections a career, that made mean trust +4.00 for thirty years running. Trust suppresses
 * reputation decay, so a permanently positive dial was a permanent discount on the single number
 * every promotion keys off — every career in the sweep came out four points of reputation and a
 * tenth of a tier ahead, for no reason anybody had chosen.
 *
 * Resetting is also the truer reading. A new government has not yet been believed or disbelieved;
 * it has no record. That is zero, not a credit.
 */
export const ELECTION_FISCAL_SWING = 18;
export const ELECTION_TRUST_RESET = 0.65;

/**
 * What each stance leans the dials toward while it is in.
 *
 * A reforming government spends and is believed until it isn't; a consolidating one cuts and is
 * trusted for it; a drifting one does neither and is credited with nothing.
 *
 * **Each column sums to zero across the three stances**, and it has to. Stances are drawn
 * uniformly, so the mean of a column is the dial's resting point over a long career — and a
 * resting point that is not zero is not weather, it is a difficulty setting applied to every
 * guardrail at once. The first version leaned fiscal to −2 and trust to −0.67 by accident.
 */
export const STANCE_FISCAL_LEAN: Record<string, number> = {
  reforming: 16,
  consolidating: -16,
  drifting: 0,
};
export const STANCE_TRUST_LEAN: Record<string, number> = {
  reforming: 10,
  consolidating: 2,
  drifting: -12,
};

/**
 * What the climate is worth, mechanically.
 *
 * Every one of these is a small multiple of a dial at full deflection, and "small" is doing real
 * work: these hooks sit on the two things the entire game is tuned against — the decay rates and
 * the unit budget. The climate is meant to change which years are hard, not which careers are
 * possible.
 */
/** Unit budget moves this fraction of itself at full fiscal deflection. */
export const CLIMATE_BUDGET_SWING = 0.18;
/** Reputation decays faster when nobody believes the administration. */
export const CLIMATE_TRUST_DECAY_SWING = 0.006;
/** An undertaking costs more effort to move in an austere year. */
export const CLIMATE_INITIATIVE_EFFORT_SWING = 0.2;
/** Austerity accelerates the country's own decline, which is what makes the bodies responsive. */
export const CLIMATE_BODY_DRIFT_SWING = 0.5;

/* -------------------------------------------------------------------- misc */

export const LOG_LIMIT = 60;
