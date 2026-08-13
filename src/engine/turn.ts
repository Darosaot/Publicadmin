/**
 * The turn loop.
 *
 * A month is resolved in three engine calls rather than one, because the middle of it needs the
 * player: effort is spent, events are drawn, the player decides each one, and only then is the
 * month closed out. The phases in `GameState` say which call comes next.
 *
 *   allocation --resolveTurn-->  event --chooseEventOption/continueAfterEvent--> report
 *                                  \                                              |
 *                                   `--(no events)--> report                      |
 *                                                                  beginNextTurn <'
 */

import {
  BASELINE_STRESS_PER_TURN,
  LOG_LIMIT,
  NETWORK_PC_GAIN,
  OVERTIME_POINTS,
  OVERTIME_STRESS,
  REST_STRESS_RELIEF,
  TASK_FAILURE_EFFECTS,
  TASK_QUALITY_EFFECTS,
} from './constants';
import { adjustStat, applyEffects, statDeltas } from './effects';
import { checkEnding } from './endings';
import { applyChoice, drawEvents, popResolvedEvent } from './events';
import {
  acceptOffer as acceptOfferInternal,
  checkForOffer,
  checkMinisterTrack,
  expireOffers,
  isReviewDue,
  runReview,
} from './career';
import { getCareerLevel, type ContentRegistry } from './registry';
import { isComplete, isDue, refillBoard, rollQuality } from './tasks';
import type {
  Allocation,
  CompletedTaskReport,
  Effect,
  FailedTaskReport,
  GameState,
  LogEntry,
  TurnReport,
} from './types';

export function emptyAllocation(): Allocation {
  return { tasks: {}, rest: 0, networking: 0, overtime: false };
}

export function effortAvailable(
  state: GameState,
  registry: ContentRegistry,
  overtime: boolean,
): number {
  const base = getCareerLevel(registry, state.player.level).effortPoints;
  return base + (overtime ? OVERTIME_POINTS : 0);
}

export function allocationTotal(allocation: Allocation): number {
  const taskPoints = Object.values(allocation.tasks).reduce((sum, n) => sum + Math.max(0, n), 0);
  return taskPoints + Math.max(0, allocation.rest) + Math.max(0, allocation.networking);
}

/**
 * Trims an allocation to what the player can actually afford.
 *
 * The UI never lets an over-budget allocation be submitted, but the autoplay simulation and any
 * future AI opponent get to be sloppy, and silently truncating beats throwing.
 */
export function normalizeAllocation(
  state: GameState,
  registry: ContentRegistry,
  allocation: Allocation,
): Allocation {
  const budget = effortAvailable(state, registry, allocation.overtime);
  const normalized: Allocation = {
    tasks: {},
    rest: 0,
    networking: 0,
    overtime: allocation.overtime,
  };

  let remaining = budget;
  for (const task of state.tasks) {
    const wanted = Math.max(0, Math.floor(allocation.tasks[task.uid] ?? 0));
    const spend = Math.min(wanted, remaining);
    if (spend > 0) {
      normalized.tasks[task.uid] = spend;
      remaining -= spend;
    }
  }

  normalized.rest = Math.min(Math.max(0, Math.floor(allocation.rest)), remaining);
  remaining -= normalized.rest;
  normalized.networking = Math.min(Math.max(0, Math.floor(allocation.networking)), remaining);

  return normalized;
}

/* ------------------------------------------------------------ resolution */

/**
 * Spends the month: effort onto tasks, quality rolls for what finished, failures for what didn't,
 * then stress and networking, then this month's events are drawn.
 */
export function resolveTurn(
  state: GameState,
  registry: ContentRegistry,
  rawAllocation: Allocation,
): GameState {
  if (state.phase !== 'allocation' || state.ending) return state;

  const allocation = normalizeAllocation(state, registry, rawAllocation);
  const statsBefore = { ...state.stats };

  let next: GameState = { ...state, stats: { ...state.stats } };

  // Effort onto the board.
  next = {
    ...next,
    tasks: next.tasks.map((task) => {
      const spend = allocation.tasks[task.uid] ?? 0;
      return spend > 0 ? { ...task, progress: task.progress + spend } : task;
    }),
  };

  const completed: CompletedTaskReport[] = [];
  const failed: FailedTaskReport[] = [];
  const followUpEffects: Effect[] = [];
  const logEntries: LogEntry[] = [];
  const survivors: typeof next.tasks = [];

  for (const task of next.tasks) {
    const template = registry.tasks[task.templateId];

    if (isComplete(task)) {
      const roll = rollQuality(next, task);
      next = { ...next, rngState: roll.rngState };

      const tierEffect = TASK_QUALITY_EFFECTS[roll.tier];
      adjustStat(next.stats, 'performance', tierEffect.performance);
      adjustStat(next.stats, 'reputation', tierEffect.reputation);

      const extra = template?.onComplete?.[roll.tier];
      if (extra) followUpEffects.push(...extra);

      completed.push({ templateId: task.templateId, tier: roll.tier, score: roll.score });
      logEntries.push({
        turn: next.turn,
        messageKey: `log.task_${roll.tier}`,
        params: { task: template?.titleKey ?? task.templateId },
        tone: roll.tier === 'poor' ? 'bad' : 'good',
      });
      continue;
    }

    if (isDue(task, next.turn)) {
      adjustStat(next.stats, 'performance', TASK_FAILURE_EFFECTS.performance);
      adjustStat(next.stats, 'reputation', TASK_FAILURE_EFFECTS.reputation);

      if (template?.onFail) followUpEffects.push(...template.onFail);

      failed.push({ templateId: task.templateId });
      logEntries.push({
        turn: next.turn,
        messageKey: 'log.task_failed',
        params: { task: template?.titleKey ?? task.templateId },
        tone: 'bad',
      });
      continue;
    }

    survivors.push(task);
  }

  next = { ...next, tasks: survivors };

  // Stress and networking.
  const stressDelta =
    BASELINE_STRESS_PER_TURN +
    (allocation.overtime ? OVERTIME_STRESS : 0) -
    allocation.rest * REST_STRESS_RELIEF;
  adjustStat(next.stats, 'stress', stressDelta);

  if (allocation.networking > 0) {
    adjustStat(next.stats, 'politicalCapital', allocation.networking * NETWORK_PC_GAIN);
  }

  next = applyEffects(next, followUpEffects, registry);

  next = {
    ...next,
    sinceReview: {
      completed: next.sinceReview.completed + completed.length,
      failed: next.sinceReview.failed + failed.length,
    },
    log: [...next.log, ...logEntries].slice(-LOG_LIMIT),
  };

  const report: TurnReport = {
    turn: next.turn,
    completed,
    failed,
    statDeltas: statDeltas(statsBefore, next.stats),
    salaryDelta: 0,
    newOffers: [],
  };
  next = { ...next, lastReport: report };

  if (next.ending) return { ...next, phase: 'ended' };

  next = drawEvents(next, registry);

  return next.pendingEvents.length > 0
    ? { ...next, phase: 'event' }
    : finalizeTurn(next, registry);
}

/* ---------------------------------------------------------------- events */

export function chooseEventOption(
  state: GameState,
  registry: ContentRegistry,
  eventId: string,
  choiceId: string,
): GameState {
  if (state.phase !== 'event') return state;
  return applyChoice(state, registry, eventId, choiceId);
}

/** Dismisses the resolved event and moves to the next one, or closes the month. */
export function continueAfterEvent(state: GameState, registry: ContentRegistry): GameState {
  if (state.phase !== 'event') return state;

  const next = popResolvedEvent(state);

  if (next.ending) return { ...next, phase: 'ended' };
  if (next.pendingEvents.length > 0) return next;

  return finalizeTurn(next, registry);
}

/* -------------------------------------------------------------- close out */

/** Reviews, promotions on offer, and the question of whether the career survived the month. */
export function finalizeTurn(state: GameState, registry: ContentRegistry): GameState {
  let next = state;
  // Copy rather than extend in place: the report already sits in `state.lastReport`, and the
  // engine must not reach back and edit a state it has already handed out.
  const previous = next.lastReport;
  const report: TurnReport = {
    turn: previous?.turn ?? next.turn,
    completed: [...(previous?.completed ?? [])],
    failed: [...(previous?.failed ?? [])],
    statDeltas: { ...(previous?.statDeltas ?? {}) },
    salaryDelta: previous?.salaryDelta ?? 0,
    newOffers: [...(previous?.newOffers ?? [])],
    review: previous?.review,
    promotedTo: previous?.promotedTo,
  };

  if (isReviewDue(next)) {
    const reviewed = runReview(next);
    next = reviewed.state;
    report.review = reviewed.report;
    report.salaryDelta += reviewed.report.salaryDelta;
    const reviewLog: LogEntry = {
      turn: next.turn,
      messageKey: `log.review_${reviewed.report.rating}`,
      tone: reviewed.report.rating === 'concerning' ? 'bad' : 'good',
    };
    next = { ...next, log: [...next.log, reviewLog].slice(-LOG_LIMIT) };
  }

  next = checkMinisterTrack(next, registry);

  const offered = checkForOffer(next, registry);
  next = offered.state;
  if (offered.offer) {
    report.newOffers.push(offered.offer);
    const offerLog: LogEntry = {
      turn: next.turn,
      messageKey: 'log.offer_received',
      params: { org: getCareerLevel(registry, offered.offer.toLevel).orgShortKey },
      tone: 'good',
    };
    next = { ...next, log: [...next.log, offerLog].slice(-LOG_LIMIT) };
  }

  const ending = checkEnding(next);
  if (ending) {
    return { ...next, lastReport: report, ending, phase: 'ended' };
  }

  return { ...next, lastReport: report, phase: 'report' };
}

/** Opens the next month: the calendar turns, offers age out, and the board refills. */
export function beginNextTurn(state: GameState, registry: ContentRegistry): GameState {
  if (state.phase !== 'report' || state.ending) return state;

  let next: GameState = {
    ...state,
    turn: state.turn + 1,
    player: { ...state.player, turnsAtLevel: state.player.turnsAtLevel + 1 },
  };

  next = expireOffers(next);
  next = refillBoard(next, registry);

  return { ...next, phase: 'allocation' };
}

/** Taking a post is a player action available from the career screen at any point in a month. */
export function acceptOffer(
  state: GameState,
  registry: ContentRegistry,
  offerId: string,
): GameState {
  if (state.ending) return state;
  return acceptOfferInternal(state, registry, offerId);
}
