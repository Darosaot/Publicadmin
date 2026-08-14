/**
 * Core contracts for the game engine.
 *
 * Everything in `src/engine/` is pure TypeScript: a GameState goes in, a new GameState comes out.
 * No React, no DOM, no Math.random. That is what makes the whole simulation testable and
 * reproducible from a seed.
 */

export type DepartmentId = 'legal' | 'projects' | 'finance' | 'procurement' | 'policy';

export const DEPARTMENT_IDS: readonly DepartmentId[] = [
  'legal',
  'projects',
  'finance',
  'procurement',
  'policy',
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
  minStat?: Partial<PlayerStats>;
  maxStat?: Partial<PlayerStats>;
  minSalary?: number;
  requiredFlags?: string[];
  forbiddenFlags?: string[];
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

/* ------------------------------------------------------------------- staff */

export type Seniority = 'junior' | 'officer' | 'senior';

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
  yearStartTurn: number;
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
  choices: Choice[];
}

/* ----------------------------------------------------------------- career */

export interface PromotionRequirement {
  minReputation: number;
  minPerformance: number;
  minPoliticalCapital?: number;
  minTurnsAtLevel: number;
}

export interface CareerLevel {
  level: number;
  titleKey: string;
  orgKey: string;
  orgShortKey: string;
  baseSalary: number;
  effortPoints: number;
  taskSlots: number;
  /**
   * How many people report to you, and the money you answer for. Absent below the first
   * management post: until then you are the one being managed.
   */
  headcount?: number;
  monthlyBudget?: number;
  /** What it takes to be offered *this* level. Absent on level 1. */
  promotion?: PromotionRequirement;
}

export interface JobOffer {
  id: string;
  toLevel: number;
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

/** How the player spent their effort points this turn. */
export interface Allocation {
  /** Task uid -> points. */
  tasks: Record<string, number>;
  rest: number;
  networking: number;
  overtime: boolean;

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
  promotedTo?: number;
  team?: TeamReport;
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
  phase: Phase;

  player: {
    name: string;
    department: DepartmentId;
    level: number;
    turnsAtLevel: number;
    salary: number;
  };

  stats: PlayerStats;

  tasks: ActiveTask[];
  nextTaskUid: number;

  /** Empty until you reach a post that has a unit under it. */
  staff: StaffMember[];
  nextStaffUid: number;
  hiring?: Hiring;
  budget?: Budget;

  pendingEvents: PendingEvent[];
  scheduledEvents: { eventId: string; onTurn: number }[];
  firedEvents: string[];
  cooldowns: Record<string, number>;
  flags: Record<string, boolean>;

  offers: JobOffer[];

  /** Rolling counters reset at each performance review. */
  sinceReview: { completed: number; failed: number };
  lastReviewTurn: number;

  log: LogEntry[];
  lastReport?: TurnReport;
  ending?: EndingId;
}
