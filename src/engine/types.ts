/**
 * Core contracts for the game engine.
 *
 * Everything in `src/engine/` is pure TypeScript: a GameState goes in, a new GameState comes out.
 * No React, no DOM, no Math.random. That is what makes the whole simulation testable and
 * reproducible from a seed.
 */

export type DepartmentId =
  | 'legal'
  | 'projects'
  | 'finance'
  | 'procurement'
  | 'policy'
  | 'inspection'
  | 'social';

export const DEPARTMENT_IDS: readonly DepartmentId[] = [
  'legal',
  'projects',
  'finance',
  'procurement',
  'policy',
  'inspection',
  'social',
];

export type StatId =
  | 'reputation'
  | 'performance'
  | 'politicalCapital'
  | 'integrity'
  | 'stress';

export const STAT_IDS: readonly StatId[] = [
  'reputation',
  'performance',
  'politicalCapital',
  'integrity',
  'stress',
];

export type PlayerStats = Record<StatId, number>;

export type EndingId =
  | 'burnout'
  | 'disgrace'
  | 'dismissed'
  | 'minister'
  | 'retirement_honoured'
  | 'retirement_quiet';

export const ENDING_IDS: readonly EndingId[] = [
  'burnout',
  'disgrace',
  'dismissed',
  'minister',
  'retirement_honoured',
  'retirement_quiet',
];

export type QualityTier = 'poor' | 'good' | 'excellent';

/** Gates whether an event may fire, or whether a choice is available to the player. */
export interface Condition {
  minLevel?: number;
  maxLevel?: number;
  departments?: DepartmentId[];
  minTurn?: number;
  /**
   * Whole years of service elapsed.
   *
   * Distinct from `minTurn` and the one to use whenever the prose says how long ago something
   * was: turns and years stopped being the same thing once a senior cycle covered a quarter.
   */
  minYearsElapsed?: number;
  /** Restricts to particular career tracks. */
  tracks?: TrackId[];
  minStat?: Partial<PlayerStats>;
  maxStat?: Partial<PlayerStats>;
  minSalary?: number;
  requiredFlags?: string[];
  forbiddenFlags?: string[];
  /** Numeric flags at or above a value. A flag that has never been set reads as 0. */
  minFlag?: Record<string, number>;
  /** Numeric flags at or below a value. */
  maxFlag?: Record<string, number>;
  /** True: only with a unit under you. False: only before you have one. */
  requiresTeam?: boolean;
  /** Gates on the state of the unit itself. */
  minTeamMorale?: number;
  maxTeamMorale?: number;
  minStaffCount?: number;
}

export type Effect =
  | { kind: 'stat'; stat: StatId; delta: number }
  | { kind: 'salary'; delta: number }
  | { kind: 'flag'; flag: string; value?: boolean }
  /** Moves a numeric flag. Absent counts as 0, so the first delta sets it. */
  | { kind: 'flagDelta'; flag: string; delta: number }
  | { kind: 'spawnTask'; templateId: string }
  | { kind: 'queueEvent'; eventId: string; delayTurns?: number }
  | { kind: 'endGame'; ending: EndingId }
  /* ---- management, no-ops for a player who has no unit yet ---- */
  | { kind: 'teamMorale'; delta: number }
  | { kind: 'teamSkill'; delta: number }
  | { kind: 'budget'; delta: number }
  /** Changes the standing monthly allocation, not a one-off. */
  | { kind: 'budgetMonthly'; delta: number }
  | { kind: 'loseStaff' }
  | { kind: 'gainStaff'; seniority: Seniority };

/* ------------------------------------------------------------------ tasks */

export interface TaskTemplate {
  id: string;
  titleKey: string;
  descKey: string;
  /** `'any'` means the template can land on any department's desk. */
  departments: DepartmentId[] | 'any';
  minLevel?: number;
  maxLevel?: number;
  /** Effort before level scaling is applied at spawn time. */
  baseEffort: number;
  /** Inclusive [min, max] months until the deadline, rolled at spawn. */
  deadlineRange: [number, number];
  difficulty: 1 | 2 | 3;
  weight: number;
  onComplete?: Partial<Record<QualityTier, Effect[]>>;
  onFail?: Effect[];
}

export interface ActiveTask {
  uid: string;
  templateId: string;
  progress: number;
  required: number;
  difficulty: 1 | 2 | 3;
  /** Absolute turn number by which the task must be finished. */
  deadlineTurn: number;
  spawnedTurn: number;
  /** Who is carrying the file this month, if you handed it to someone. */
  assignedTo?: string;
}

/* ------------------------------------------------------------- initiatives */

/**
 * Something the player decided to do, rather than something that landed on the desk.
 *
 * Files arrive by weight and have to be dealt with. An initiative is the opposite: nothing
 * produces one, nothing chases it, and it finishes years after it starts or not at all. It is the
 * only thing in the game the player picks rather than receives.
 */
export interface InitiativeTemplate {
  id: string;
  titleKey: string;
  descKey: string;
  /** What the player is told when it lands. */
  completeKey: string;
  /** And when it is quietly dropped. */
  lapseKey: string;
  /** Total effort points to finish. */
  required: number;
  /**
   * The fewest cycles it can possibly take.
   *
   * Institutions do not move faster because you had a slack month. This caps how much progress a
   * single cycle can absorb at `ceil(required / minCycles)`, which is what stops an initiative
   * being a way to bank one quiet month into a payoff.
   */
  minCycles: number;
  /** Who may start it, and when. */
  available: Condition;
  /** The payoff. Pays in kind — body condition, flags, tasks — rarely in reputation. */
  onComplete: Effect[];
  /** What it costs to have started something and let it die. */
  onLapse: Effect[];
}

/** One the player has actually started. */
export interface ActiveInitiative {
  /**
   * The template id doubles as the identity: the same undertaking never runs twice, so there is
   * no uid to allocate and no way for two copies to disagree.
   */
  templateId: string;
  progress: number;
  required: number;
  startedTurn: number;
  /** Consecutive cycles with nothing put in. Past `INITIATIVE_LAPSE_CYCLES` it collapses. */
  idleCycles: number;
  /** Who is carrying it this cycle, if you handed it to someone. */
  assignedTo?: string;
}

/* ------------------------------------------------------------------- staff */

export type Seniority = 'junior' | 'officer' | 'senior';

/**
 * Somebody who used to work for you.
 *
 * Kept because a career is largely the people who passed through it, and because an office you
 * built should be able to turn up again years later in somebody else's building. `regard` is what
 * they thought of you when they left; it is the only thing here the player can affect after the
 * fact, and they cannot.
 */
export interface DepartedStaff {
  name: string;
  seniority: Seniority;
  skill: number;
  regard: number;
  leftOnTurn: number;
  /** Where they went, as a body id, once they have turned up somewhere. */
  nowAt?: string;
}

export const SENIORITIES: readonly Seniority[] = ['junior', 'officer', 'senior'];

/**
 * A person in your unit.
 *
 * Names are literal strings rather than translation keys: they are proper nouns, generated at
 * hire time from a pool, and translating them would be wrong in any language.
 */
export interface StaffMember {
  id: string;
  name: string;
  seniority: Seniority;
  /** How good they are at the work, 0–100. Grows with coaching and experience. */
  skill: number;
  /** How willing they are to do it, 0–100. Decays without attention; drives attrition. */
  morale: number;
  /** Monthly cost to the unit budget. */
  salary: number;
  monthsInPost: number;
}

/** A recruitment in progress. Posts take months to fill, as they do. */
export interface Hiring {
  seniority: Seniority;
  monthsRemaining: number;
}

/**
 * The unit's money.
 *
 * `balance` accumulates across the year and is judged annually. Overspending is the obvious
 * failure; a large underspend is also punished, because a budget you did not need is a budget
 * you will not be given again.
 */
export interface Budget {
  monthly: number;
  balance: number;
  /** Turn on which the current budget year began. */
  /**
   * Calendar month in which the current budget year began.
   *
   * Months, not turns. A budget year is a year — but a cycle is one month at a junior desk and six
   * in a directorate, so counting turns made a Director-General's "year" six real ones.
   */
  yearStartMonth: number;
  /** Discretionary commitments made this month, cleared at resolution. */
  spentThisMonth: number;
}

/* ----------------------------------------------------------------- events */

export type EventKind = 'random' | 'milestone' | 'followup';

export interface Outcome {
  weight: number;
  textKey: string;
  effects: Effect[];
  /**
   * Restricts when this outcome can be rolled. This is how a decision taken years earlier
   * changes how a later scene lands — the flag set back then gates the outcome now. At least one
   * outcome per choice must be unconditional, so a choice can never dead-end.
   */
  conditions?: Condition;
}

export interface Choice {
  id: string;
  labelKey: string;
  conditions?: Condition;
  outcomes: Outcome[];
}

export interface GameEvent {
  id: string;
  kind: EventKind;
  titleKey: string;
  bodyKey: string;
  conditions?: Condition;
  weight: number;
  once?: boolean;
  /** Turns before this event may be drawn again. Defaults to RANDOM_EVENT_COOLDOWN. */
  cooldown?: number;
  /**
   * This event's prose names a former colleague through `{alum}`.
   *
   * One declaration doing two jobs. It makes the event ineligible when there is nobody on the
   * roster to name — prose reading "…and then said nothing" is worse than an event that does not
   * fire — and it tells `drawEvents` which way to point `alum.spotlight`: at whoever thought best
   * of you, or whoever thought worst.
   *
   * `validate.ts` checks this in both directions. Prose using `{alum}` without the declaration
   * fails the build; the declaration without `{alum}` in the prose fails it too. The second
   * direction is the one that matters: it is what stops the interpolation channel being built and
   * then quietly used by nothing, which is exactly what happened the first time.
   */
  namesAlumnus?: 'warm' | 'cold';
  choices: Choice[];
}

/* ----------------------------------------------------------------- career */

export interface PromotionRequirement {
  minReputation: number;
  minPerformance: number;
  minPoliticalCapital?: number;
  minTurnsAtLevel: number;
}

/**
 * The four ways a career can go after the second rung.
 *
 * `line` is management: more people, more budget, more of the institution. `expert` trades the
 * unit for the hardest files and the authority that comes with them. `political` is fast, powerful
 * and has no tenure at all. `oversight` inspects the administrations the other three work inside.
 */
export type TrackId = 'line' | 'expert' | 'political' | 'oversight';

export const TRACK_IDS: readonly TrackId[] = ['line', 'expert', 'political', 'oversight'];

/** One way into a post. Entry terms belong to the edge, because the same post can be reached
 *  from different places on different terms. */
export interface PostEdge {
  /** The post you must currently hold. */
  from: string;
  requires: PromotionRequirement;
  /** A move across rather than up: the salary rule does not apply to it. */
  sideways?: boolean;
}

export interface Post {
  id: string;
  /**
   * Seniority band, 1–5.
   *
   * Several posts share a tier — that is what makes the ladder a tree. Everything that used to
   * key off "level" still keys off this: effort scaling, credit scaling, and every `minLevel` /
   * `maxLevel` gate in the corpus.
   */
  tier: number;
  track: TrackId;
  titleKey: string;
  orgKey: string;
  orgShortKey: string;
  baseSalary: number;
  effortPoints: number;
  taskSlots: number;
  /**
   * Calendar months one turn of this post covers.
   *
   * A junior desk turns over monthly. A directorate does not: the decisions are the same number
   * per cycle, but the cycle is a quarter. This is what lets a 120-turn game be a thirty-year
   * career rather than a ten-year one, without asking the player for three times the clicks.
   */
  monthsPerTurn: number;
  /**
   * How many people report to you, and the money you answer for. Absent below the first
   * management post: until then you are the one being managed.
   */
  headcount?: number;
  monthlyBudget?: number;
  /** Every way into this post. Empty means it is where a career starts. */
  from: PostEdge[];
}

export interface JobOffer {
  id: string;
  toPost: string;
  /** The tier of the post offered, so the UI can say whether this is up or across. */
  toTier: number;
  sideways?: boolean;
  salary: number;
  createdTurn: number;
  expiresTurn: number;
}

/* ------------------------------------------------------------------ state */

export type Phase = 'title' | 'setup' | 'allocation' | 'event' | 'report' | 'ended';

export interface Department {
  id: DepartmentId;
  nameKey: string;
  blurbKey: string;
  flavourKey: string;
  startingAdjustments: Partial<PlayerStats>;
}

/**
 * A public body, as the engine needs to see it.
 *
 * Deliberately the smallest possible view. The content side carries the name, the prose and the
 * authoring helpers; all the engine does is drift these places month by month, for which it needs
 * to know only where each one started and which way it is going.
 *
 * The scores themselves live in `flags` — `body.<id>.cond` and `body.<id>.stand` — holding the
 * *deviation* from `baselineCondition`, so an unset flag reads as a body nobody has touched. That
 * is what lets the country exist without a save migration.
 */
export interface WorldBody {
  id: string;
  /** Where this place sits when the career starts, 0–100. */
  baselineCondition: number;
  /** Change per calendar month with nobody intervening. Negative places are quietly rotting. */
  drift: number;
  /** The department that deals with this place, and so already knows what state it is in. */
  beat: DepartmentId;
}

/** How the player spent their effort points this turn. */
export interface Allocation {
  /** Task uid -> points. */
  tasks: Record<string, number>;
  rest: number;
  networking: number;
  overtime: boolean;
  /** Initiative template id -> points. Desk work, so it competes with the board directly. */
  initiativeEffort: Record<string, number>;

  /* ---- management, available once you have a unit ---- */

  /** Task uid -> staff id. Handing a file over costs a point of oversight, not the whole job. */
  delegations: Record<string, string>;
  /** Staff ids being coached this month: slower than doing it yourself, permanent. */
  coaching: string[];
  /** Staff ids getting your actual attention this month. */
  oneToOnes: string[];
  /** Keep a recruitment moving. */
  recruiting: boolean;
  /** Buy in agency staff for the month: money for effort. */
  agencyTemps: number;
  /** Staff ids sent on a training course, paid from the budget rather than your time. */
  training: string[];
  /** Initiative template id -> staff id. Shares the same carrying capacity as files do. */
  initiativeDelegations: Record<string, string>;
}

export interface CompletedTaskReport {
  templateId: string;
  tier: QualityTier;
  score: number;
}

export interface FailedTaskReport {
  templateId: string;
}

export type ReviewRating = 'outstanding' | 'solid' | 'adequate' | 'concerning';

export interface ReviewReport {
  rating: ReviewRating;
  reputationDelta: number;
  salaryDelta: number;
}

/** What the unit did with its month. */
export interface TeamReport {
  /** Progress delivered by staff on files you handed over. */
  delegatedProgress: { staffName: string; taskTemplateId: string; progress: number }[];
  departures: { name: string; reason: 'morale' | 'promoted_away' }[];
  /** People who moved up a grade without leaving. */
  promotions?: { name: string; to: Seniority }[];
  arrivals: { name: string; seniority: Seniority }[];
  /** Spend against the monthly allocation: negative means over. */
  budgetDelta?: number;
  budgetVerdict?: 'overspent' | 'underspent';
}

/** Everything that happened in one month, for the end-of-turn report screen. */
export interface TurnReport {
  turn: number;
  completed: CompletedTaskReport[];
  failed: FailedTaskReport[];
  statDeltas: Partial<PlayerStats>;
  salaryDelta: number;
  review?: ReviewReport;
  newOffers: JobOffer[];
  team?: TeamReport;
  /** Undertakings that landed or died this cycle. Template ids; the UI looks up the prose. */
  initiativesCompleted?: string[];
  initiativesLapsed?: string[];
}

export interface LogEntry {
  turn: number;
  messageKey: string;
  params?: Record<string, string | number>;
  tone: 'neutral' | 'good' | 'bad';
}

/** A resolved event awaiting the player's decision, or showing its outcome. */
export interface PendingEvent {
  eventId: string;
  /** Set once the player has chosen; holds the rolled outcome to display. */
  resolution?: {
    choiceId: string;
    outcomeIndex: number;
    textKey: string;
  };
}

export interface GameState {
  saveVersion: number;
  seed: number;
  rngState: number;

  turn: number;
  /**
   * Months elapsed since the first day, which is not the same as `turn`.
   *
   * A turn is one decision cycle. At a junior desk that is a month; a Director-General does not
   * re-plan their directorate every four weeks, so the same 120 turns cover a whole working life
   * instead of a decade. Deadlines stay in turns — a senior file genuinely runs longer.
   */
  calendarMonth: number;
  phase: Phase;

  player: {
    name: string;
    department: DepartmentId;
    postId: string;
    /** Always the current post's tier. Kept on the player so content gating stays a plain
     *  numeric comparison and does not need the registry. */
    level: number;
    /** Likewise denormalised from the post, so `Condition.tracks` costs nothing to check. */
    track: TrackId;
    turnsAtLevel: number;
    salary: number;
  };

  stats: PlayerStats;

  tasks: ActiveTask[];
  nextTaskUid: number;

  /**
   * Undertakings in flight.
   *
   * Deliberately transient: an initiative leaves `init.done.<id>` or `init.lapsed.<id>` behind in
   * `flags` and is then removed from this list. The live record is first-class because it has a
   * progress bar and a delegate; the permanent memory is a flag, because a thirty-year career
   * would otherwise carry an archive of forty finished projects in every save.
   */
  initiatives: ActiveInitiative[];

  /**
   * People who have worked for you and moved on, newest last, capped at `ALUMNI_LIMIT`.
   *
   * Bounded on purpose: a thirty-year career would otherwise accumulate an unbounded roster in
   * every save, and the twelve most recent are the ones a player might plausibly remember.
   */
  alumni: DepartedStaff[];

  /** Empty until you reach a post that has a unit under it. */
  staff: StaffMember[];
  nextStaffUid: number;
  hiring?: Hiring;
  budget?: Budget;

  pendingEvents: PendingEvent[];
  scheduledEvents: { eventId: string; onTurn: number }[];
  firedEvents: string[];
  cooldowns: Record<string, number>;
  /**
   * Named state set by choices, and the game's memory.
   *
   * Values may be boolean or numeric. Booleans are the original form — "this happened" — and
   * numbers are for the things that were always really a quantity and had been flattened to a
   * bit: how much a person owes you, how warm a relationship is. Both read as truthy/falsy, so
   * `requiredFlags` and `forbiddenFlags` work the same on either.
   */
  flags: Record<string, boolean | number>;

  offers: JobOffer[];

  /** Rolling counters reset at each performance review. */
  sinceReview: { completed: number; failed: number };
  lastReviewTurn: number;

  log: LogEntry[];
  lastReport?: TurnReport;
  ending?: EndingId;
}
