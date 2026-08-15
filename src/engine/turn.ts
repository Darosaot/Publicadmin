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
  AGENCY_TEMP_COST,
  AGENCY_TEMP_EFFORT,
  AGENCY_TEMP_MAX,
  BASELINE_STRESS_PER_TURN,
  COACHING_EFFORT_COST,
  DELEGATION_CAPACITY,
  DELEGATION_EFFORT_COST,
  LOG_LIMIT,
  NETWORK_PC_GAIN,
  ONE_TO_ONE_EFFORT_COST,
  OVERTIME_POINTS,
  OVERTIME_STRESS,
  PERFORMANCE_BASELINE,
  PERFORMANCE_REVERSION_RATE,
  POLITICAL_CAPITAL_DECAY_RATE,
  RECRUITING_EFFORT_COST,
  REPUTATION_DECAY_RATE,
  REST_STRESS_RELIEF,
  STAFF_MORALE_ON_TASK_EXCELLENT,
  STAFF_MORALE_ON_TASK_FAILURE,
  TRAINING_COST,
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
import { getPost, type ContentRegistry } from './registry';
import { creditScale, isComplete, isDue, refillBoard, rollQuality, scaleCredit } from './tasks';
import {
  applyInitiativeAssignments,
  cycleCap,
  lapseAllInitiatives,
  resolveInitiatives,
} from './initiatives';
import { driftWorld, learnLocalBodies } from './world';
import {
  adjustStaffMorale,
  applyAssignments,
  delegatedQualityBase,
  findStaff,
  hasTeam,
  resolveAttrition,
  resolveBudget,
  resolveStaffMonth,
  staffOutput,
} from './team';
import type {
  Allocation,
  CompletedTaskReport,
  Effect,
  FailedTaskReport,
  GameState,
  LogEntry,
  TeamReport,
  TurnReport,
} from './types';

export function emptyAllocation(): Allocation {
  return {
    tasks: {},
    rest: 0,
    networking: 0,
    overtime: false,
    initiativeEffort: {},
    delegations: {},
    coaching: [],
    oneToOnes: [],
    recruiting: false,
    agencyTemps: 0,
    training: [],
    initiativeDelegations: {},
  };
}

export function effortAvailable(
  state: GameState,
  registry: ContentRegistry,
  overtime: boolean,
  agencyTemps = 0,
): number {
  const base = getPost(registry, state.player.postId).effortPoints;
  const bought = Math.min(Math.max(0, agencyTemps), AGENCY_TEMP_MAX) * AGENCY_TEMP_EFFORT;
  return base + (overtime ? OVERTIME_POINTS : 0) + bought;
}

/** The effort cost of the management half of a month. */
export function managementCost(allocation: Allocation): number {
  return (
    (Object.keys(allocation.delegations).length +
      Object.keys(allocation.initiativeDelegations).length) *
      DELEGATION_EFFORT_COST +
    allocation.coaching.length * COACHING_EFFORT_COST +
    allocation.oneToOnes.length * ONE_TO_ONE_EFFORT_COST +
    (allocation.recruiting ? RECRUITING_EFFORT_COST : 0)
  );
}

export function allocationTotal(allocation: Allocation): number {
  const taskPoints = Object.values(allocation.tasks).reduce((sum, n) => sum + Math.max(0, n), 0);
  // Initiative effort is ordinary desk work and counts here in full. Leaving it out would make
  // the UI over-report what is left while the engine silently truncated the difference — the two
  // would disagree about the same month.
  const initiativePoints = Object.values(allocation.initiativeEffort).reduce(
    (sum, n) => sum + Math.max(0, n),
    0,
  );
  return (
    taskPoints +
    initiativePoints +
    Math.max(0, allocation.rest) +
    Math.max(0, allocation.networking) +
    managementCost(allocation)
  );
}

/** What the month's discretionary decisions cost the unit budget. */
export function discretionarySpend(allocation: Allocation): number {
  return (
    Math.min(Math.max(0, allocation.agencyTemps), AGENCY_TEMP_MAX) * AGENCY_TEMP_COST +
    allocation.training.length * TRAINING_COST
  );
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
  const managing = hasTeam(state, registry);
  const staffIds = new Set(state.staff.map((s) => s.id));
  const taskIds = new Set(state.tasks.map((t) => t.uid));
  const activeInitiativeIds = new Set(state.initiatives.map((i) => i.templateId));

  const agencyTemps = managing
    ? Math.min(Math.max(0, Math.floor(allocation.agencyTemps)), AGENCY_TEMP_MAX)
    : 0;

  const normalized: Allocation = {
    tasks: {},
    rest: 0,
    networking: 0,
    overtime: allocation.overtime,
    initiativeEffort: {},
    delegations: {},
    coaching: [],
    oneToOnes: [],
    recruiting: false,
    agencyTemps,
    training: [],
    initiativeDelegations: {},
  };

  let remaining = effortAvailable(state, registry, allocation.overtime, agencyTemps);

  // Management comes off the top: these commitments are made before the desk work.
  if (managing) {
    // Nobody may be handed more than they can carry. Enforced here, once, so that everything
    // downstream — assignment, output, quality — can trust the allocation it is given.
    const carrying = new Map<string, number>();
    const capacityOf = (staffId: string) => {
      const member = state.staff.find((s) => s.id === staffId);
      return member ? DELEGATION_CAPACITY[member.seniority] : 0;
    };

    for (const [taskUid, staffId] of Object.entries(allocation.delegations)) {
      if (!taskIds.has(taskUid) || !staffIds.has(staffId)) continue;
      if ((carrying.get(staffId) ?? 0) >= capacityOf(staffId)) continue;
      if (remaining < DELEGATION_EFFORT_COST) break;
      normalized.delegations[taskUid] = staffId;
      carrying.set(staffId, (carrying.get(staffId) ?? 0) + 1);
      remaining -= DELEGATION_EFFORT_COST;
    }
    for (const staffId of allocation.coaching) {
      if (!staffIds.has(staffId) || normalized.coaching.includes(staffId)) continue;
      if (remaining < COACHING_EFFORT_COST) break;
      normalized.coaching.push(staffId);
      remaining -= COACHING_EFFORT_COST;
    }
    for (const staffId of allocation.oneToOnes) {
      if (!staffIds.has(staffId) || normalized.oneToOnes.includes(staffId)) continue;
      if (remaining < ONE_TO_ONE_EFFORT_COST) break;
      normalized.oneToOnes.push(staffId);
      remaining -= ONE_TO_ONE_EFFORT_COST;
    }
    // Handing an initiative to someone runs through the same capacity budget as a file, because
    // it is the same person's month either way.
    for (const [templateId, staffId] of Object.entries(allocation.initiativeDelegations)) {
      if (!activeInitiativeIds.has(templateId) || !staffIds.has(staffId)) continue;
      if ((carrying.get(staffId) ?? 0) >= capacityOf(staffId)) continue;
      if (remaining < DELEGATION_EFFORT_COST) break;
      normalized.initiativeDelegations[templateId] = staffId;
      carrying.set(staffId, (carrying.get(staffId) ?? 0) + 1);
      remaining -= DELEGATION_EFFORT_COST;
    }
    if (allocation.recruiting && state.hiring && remaining >= RECRUITING_EFFORT_COST) {
      normalized.recruiting = true;
      remaining -= RECRUITING_EFFORT_COST;
    }
    normalized.training = allocation.training.filter((id) => staffIds.has(id));
  }

  // Initiatives are settled before the board, not after it.
  //
  // This is the whole point of the mechanic: something you chose has to be paid for ahead of the
  // work that arrived, or it only ever gets the leftovers and never finishes. The per-cycle cap
  // means a flush month cannot buy the whole thing at once — see `cycleCap`.
  for (const initiative of state.initiatives) {
    const template = registry.initiatives.find((t) => t.id === initiative.templateId);
    if (!template) continue;

    const wanted = Math.max(0, Math.floor(allocation.initiativeEffort[initiative.templateId] ?? 0));
    const spend = Math.min(wanted, cycleCap(template), remaining);
    if (spend > 0) {
      normalized.initiativeEffort[initiative.templateId] = spend;
      remaining -= spend;
    }
  }

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
  const team: TeamReport = { delegatedProgress: [], departures: [], arrivals: [] };

  // Record who is carrying what before anyone does any work.
  next = applyAssignments(next, allocation);
  next = applyInitiativeAssignments(next, allocation);

  // Your own effort onto the board.
  next = {
    ...next,
    tasks: next.tasks.map((task) => {
      const spend = allocation.tasks[task.uid] ?? 0;
      return spend > 0 ? { ...task, progress: task.progress + spend } : task;
    }),
  };

  // Then the unit's. Their output is computed from this month's skill and morale, before any
  // coaching lands, so investing in someone pays from next month rather than instantly.
  //
  // A month is a month: someone carrying two files splits it between them rather than giving each
  // a full one. `normalizeAllocation` has already capped how many anyone may hold.
  const load = new Map<string, number>();
  for (const task of next.tasks) {
    if (task.assignedTo) load.set(task.assignedTo, (load.get(task.assignedTo) ?? 0) + 1);
  }

  next = {
    ...next,
    tasks: next.tasks.map((task) => {
      if (!task.assignedTo) return task;
      const member = findStaff(next, task.assignedTo);
      if (!member) return task;

      const share = Math.max(1, load.get(member.id) ?? 1);
      const contribution = Math.max(1, Math.round(staffOutput(member) / share));
      team.delegatedProgress.push({
        staffName: member.name,
        taskTemplateId: task.templateId,
        progress: contribution,
      });
      return { ...task, progress: task.progress + contribution };
    }),
  };

  // One file is worth less to a director with eight of them than to an officer with four.
  const credit = creditScale(getPost(registry, next.player.postId).taskSlots);

  const completed: CompletedTaskReport[] = [];
  const failed: FailedTaskReport[] = [];
  const followUpEffects: Effect[] = [];
  const logEntries: LogEntry[] = [];
  const survivors: typeof next.tasks = [];
  /** Morale consequences for the people whose files landed well or badly. */
  const staffMoraleDeltas: Record<string, number> = {};

  for (const task of next.tasks) {
    const template = registry.tasks[task.templateId];
    const carrier = task.assignedTo ? findStaff(next, task.assignedTo) : undefined;

    if (isComplete(task)) {
      // A delegated file is judged on the ability of whoever actually did it.
      const roll = rollQuality(
        next,
        task,
        carrier ? delegatedQualityBase(carrier) : undefined,
      );
      next = { ...next, rngState: roll.rngState };

      const tierEffect = TASK_QUALITY_EFFECTS[roll.tier];
      adjustStat(next.stats, 'performance', scaleCredit(tierEffect.performance, credit));
      adjustStat(next.stats, 'reputation', scaleCredit(tierEffect.reputation, credit));

      if (carrier && roll.tier === 'excellent') {
        staffMoraleDeltas[carrier.id] =
          (staffMoraleDeltas[carrier.id] ?? 0) + STAFF_MORALE_ON_TASK_EXCELLENT;
      }

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
      adjustStat(next.stats, 'performance', scaleCredit(TASK_FAILURE_EFFECTS.performance, credit));
      adjustStat(next.stats, 'reputation', scaleCredit(TASK_FAILURE_EFFECTS.reputation, credit));

      // Missing a deadline lands on whoever was holding it, not only on you.
      if (carrier) {
        staffMoraleDeltas[carrier.id] =
          (staffMoraleDeltas[carrier.id] ?? 0) + STAFF_MORALE_ON_TASK_FAILURE;
      }

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

  // Then the things you started. After the board, because a month's files are what the initiative
  // was competing against, and their outcomes are already settled by the time it is scored.
  const initiativeResult = resolveInitiatives(next, registry, allocation);
  next = initiativeResult.state;
  followUpEffects.push(...initiativeResult.effects);
  logEntries.push(...initiativeResult.log);

  for (const [staffId, delta] of Object.entries(staffMoraleDeltas)) {
    next = adjustStaffMorale(next, staffId, delta);
  }

  // Monthly drift: standing and allies fade, form returns to the middle. See `constants.ts`.
  adjustStat(
    next.stats,
    'reputation',
    -Math.round(next.stats.reputation * REPUTATION_DECAY_RATE),
  );
  adjustStat(
    next.stats,
    'politicalCapital',
    -Math.round(next.stats.politicalCapital * POLITICAL_CAPITAL_DECAY_RATE),
  );
  adjustStat(
    next.stats,
    'performance',
    -Math.round((next.stats.performance - PERFORMANCE_BASELINE) * PERFORMANCE_REVERSION_RATE),
  );

  // Stress and networking.
  const stressDelta =
    BASELINE_STRESS_PER_TURN +
    (allocation.overtime ? OVERTIME_STRESS : 0) -
    allocation.rest * REST_STRESS_RELIEF;
  adjustStat(next.stats, 'stress', stressDelta);

  if (allocation.networking > 0) {
    adjustStat(next.stats, 'politicalCapital', allocation.networking * NETWORK_PC_GAIN);
  }

  // The unit's month: attention paid, recruitment advanced, money spent, people lost.
  if (hasTeam(next, registry)) {
    const staffMonth = resolveStaffMonth(next, registry, allocation);
    next = staffMonth.state;
    team.arrivals.push(...staffMonth.report.arrivals);

    const budgetResult = resolveBudget(next, discretionarySpend(allocation));
    next = budgetResult.state;
    team.budgetDelta = budgetResult.delta;
    team.budgetVerdict = budgetResult.verdict;

    if (budgetResult.verdict) {
      logEntries.push({
        turn: next.turn,
        messageKey: `log.budget_${budgetResult.verdict}`,
        tone: 'bad',
      });
    }

    const attrition = resolveAttrition(next, registry);
    next = attrition.state;
    team.departures.push(...attrition.report.departures);

    for (const departure of attrition.report.departures) {
      logEntries.push({
        turn: next.turn,
        messageKey: 'log.staff_left',
        params: { name: departure.name },
        tone: 'bad',
      });
    }
    for (const arrival of team.arrivals) {
      logEntries.push({
        turn: next.turn,
        messageKey: 'log.staff_joined',
        params: { name: arrival.name },
        tone: 'good',
      });
    }
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
    team: hasTeam(next, registry) ? team : undefined,
    initiativesCompleted:
      initiativeResult.completed.length > 0 ? initiativeResult.completed : undefined,
    initiativesLapsed: initiativeResult.lapsed.length > 0 ? initiativeResult.lapsed : undefined,
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
  //
  // Spread first. This used to enumerate every field, which made it a silent trap the equal of
  // `cloneState`: anything `resolveTurn` added to the report was dropped here, before the player
  // ever saw it — no type error, because every *required* field was still present.
  const previous = next.lastReport;
  const report: TurnReport = {
    ...previous,
    turn: previous?.turn ?? next.turn,
    // The mutable members still need fresh copies, for the reason above.
    completed: [...(previous?.completed ?? [])],
    failed: [...(previous?.failed ?? [])],
    statDeltas: { ...(previous?.statDeltas ?? {}) },
    salaryDelta: previous?.salaryDelta ?? 0,
    newOffers: [...(previous?.newOffers ?? [])],
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
      params: { org: getPost(registry, offered.offer.toPost).orgShortKey },
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

/** Opens the next cycle: the calendar turns, offers age out, and the board refills. */
export function beginNextTurn(state: GameState, registry: ContentRegistry): GameState {
  if (state.phase !== 'report' || state.ending) return state;

  // The calendar moves by the length of the cycle you have just worked, not by a flat month.
  const worked = getPost(registry, state.player.postId).monthsPerTurn;

  let next: GameState = {
    ...state,
    turn: state.turn + 1,
    calendarMonth: state.calendarMonth + worked,
    player: { ...state.player, turnsAtLevel: state.player.turnsAtLevel + 1 },
  };

  next = expireOffers(next);
  next = refillBoard(next, registry);
  // The rest of the country moved while you were working. By the same months, so a directorate's
  // cycle takes half a year off every other institution too.
  next = driftWorld(next, registry, worked);
  // A post change may have moved the player to a different beat, and the institutions on it are
  // ones you deal with rather than ones you have to go and find.
  next = learnLocalBodies(next, registry);

  return { ...next, phase: 'allocation' };
}

/** Taking a post is a player action available from the career screen at any point in a month. */
export function acceptOffer(
  state: GameState,
  registry: ContentRegistry,
  offerId: string,
): GameState {
  if (state.ending) return state;

  // Whatever you had started, you are not the one finishing it. An initiative is bound to the
  // office that began it: the successor inherits the file and not the intent. The board follows
  // the same rule, but a file is one month's work and an initiative may be five years of it, so
  // this one gets its `onLapse` and a line in the log rather than vanishing.
  const ended = lapseAllInitiatives(state, registry);
  const cleared =
    ended.effects.length > 0 || ended.log.length > 0
      ? applyEffects(
          { ...ended.state, log: [...ended.state.log, ...ended.log].slice(-LOG_LIMIT) },
          ended.effects,
          registry,
        )
      : ended.state;

  return acceptOfferInternal(cleared, registry, offerId);
}
