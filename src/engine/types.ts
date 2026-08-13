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
}

export type Effect =
  | { kind: 'stat'; stat: StatId; delta: number }
  | { kind: 'salary'; delta: number }
  | { kind: 'flag'; flag: string; value?: boolean }
  | { kind: 'spawnTask'; templateId: string }
  | { kind: 'queueEvent'; eventId: string; delayTurns?: number }
  | { kind: 'endGame'; ending: EndingId };

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
