/**
 * The unit: the people who work for you, and the money you answer for.
 *
 * From the first management post onward the game changes shape. Below it you are the person doing
 * the work, and effort points are hours at your own desk. Above it most of the output in your name
 * is produced by other people, and your effort goes on deciding who carries what, keeping them in
 * a state to carry it, and defending the budget that pays for them.
 *
 * Everything here is pure: state in, state out, all randomness through the cursor in the state.
 */

import {
  BUDGET_OVERSPEND_REPUTATION,
  BUDGET_OVERSPEND_TOLERANCE,
  BUDGET_UNDERSPEND_CUT,
  BUDGET_UNDERSPEND_REPUTATION,
  BUDGET_UNDERSPEND_TOLERANCE,
  BUDGET_YEAR_MONTHS,
  COACHING_MORALE_GAIN,
  COACHING_SKILL_GAIN,
  HIRING_MONTHS,
  KEEP_ON_MOVE_LIMIT,
  POACHING_CHANCE,
  POACHING_MORALE,
  POACHING_SKILL,
  PROMOTION_SKILL,
  LOG_LIMIT,
  ONE_TO_ONE_MORALE_GAIN,
  STAFF_ATTRITION_CHANCE,
  STAFF_ATTRITION_MORALE,
  STAFF_BASE_OUTPUT,
  STAFF_MORALE_DRIFT,
  STAFF_SALARY,
  STAFF_SKILL_DRIFT_PER_YEAR,
  STAFF_START_MORALE,
  STAFF_START_SKILL,
  TRAINING_SKILL_GAIN,
} from './constants';
import { remember } from './alumni';
import { knownBodies } from './world';
import { hiringMoraleDelta, hiringSkillDelta, hoursMoraleDelta } from './directives';
import { getPost, type ContentRegistry } from './registry';
import { nextChance, nextInt, pick } from './rng';
import type {
  Allocation,
  Budget,
  GameState,
  Seniority,
  StaffMember,
  TeamReport,
} from './types';

/** Clamps a staff attribute to the same 0–100 range the player's stats use. */
function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function headcountFor(state: GameState, registry: ContentRegistry): number {
  return getPost(registry, state.player.postId).headcount ?? 0;
}

export function hasTeam(state: GameState, registry: ContentRegistry): boolean {
  return headcountFor(state, registry) > 0;
}

export function findStaff(state: GameState, id: string): StaffMember | undefined {
  return state.staff.find((s) => s.id === id);
}

/* ------------------------------------------------------------ recruitment */

/**
 * Generates a person. Skill is rolled inside the band for their grade, so a new senior is
 * reliably better than a new junior but never a known quantity.
 */
export function createStaff(
  state: GameState,
  registry: ContentRegistry,
  seniority: Seniority,
): { state: GameState; staff: StaffMember } {
  let rng = state.rngState;

  const taken = new Set(state.staff.map((s) => s.name));
  const available = registry.staffNames.filter((n) => !taken.has(n));
  const namePick = pick(rng, available.length > 0 ? available : registry.staffNames);
  rng = namePick.rngState;

  const [skillMin, skillMax] = STAFF_START_SKILL[seniority];
  const skillRoll = nextInt(rng, skillMin, skillMax);
  rng = skillRoll.rngState;

  const moraleRoll = nextInt(rng, STAFF_START_MORALE[0], STAFF_START_MORALE[1]);
  rng = moraleRoll.rngState;

  const staff: StaffMember = {
    id: `s${state.nextStaffUid}`,
    name: namePick.value ?? `Officer ${state.nextStaffUid}`,
    seniority,
    // Potential arrives cheaper and keener; experience arrives able and settled.
    skill: clamp(skillRoll.value + hiringSkillDelta(state)),
    morale: clamp(moraleRoll.value + hiringMoraleDelta(state)),
    salary: STAFF_SALARY[seniority],
    monthsInPost: 0,
  };

  return {
    state: { ...state, rngState: rng, nextStaffUid: state.nextStaffUid + 1 },
    staff,
  };
}

/**
 * Builds the unit you inherit on arriving in a management post.
 *
 * Deliberately one short of the establishment: every new post comes with a vacancy someone has
 * been meaning to fill, which puts recruitment in front of the player immediately.
 */
export function setupTeamForPost(
  state: GameState,
  registry: ContentRegistry,
  /**
   * Staff ids to bring with you, capped at `KEEP_ON_MOVE_LIMIT`.
   *
   * They arrive with their skill, morale and tenure intact, which is the whole point: an office
   * you spent nine years building should be able to leave something behind in you as well as in
   * the building. Everybody else joins the alumni.
   */
  keep: readonly string[] = [],
): GameState {
  const post = getPost(registry, state.player.postId);
  const headcount = post.headcount ?? 0;

  const kept = state.staff.filter((s) => keep.includes(s.id)).slice(0, KEEP_ON_MOVE_LIMIT);
  const keptIds = new Set(kept.map((s) => s.id));
  const left = state.staff.filter((s) => !keptIds.has(s.id));

  if (headcount === 0) {
    // The expert track has no unit, so a move onto it hands one over. Losing eight people you
    // spent years building is not something to do silently in a state update — the log is the
    // only place the player will ever be told, so it says so.
    const handover =
      state.staff.length > 0
        ? [
            {
              turn: state.turn,
              messageKey: 'log.unit_handed_over',
              params: { count: String(state.staff.length) },
              tone: 'bad' as const,
            },
          ]
        : [];

    // A post with no unit cannot keep anyone, however much you wanted to.
    return {
      ...remember(state, state.staff),
      staff: [],
      hiring: undefined,
      budget: undefined,
      log: [...state.log, ...handover].slice(-LOG_LIMIT),
    };
  }

  // A plausible shape: one senior, then officers, with juniors making up the rest.
  const shape: Seniority[] = [];
  for (let i = 0; i < headcount - 1; i += 1) {
    if (i === 0) shape.push('senior');
    else if (i <= Math.ceil((headcount - 1) / 2)) shape.push('officer');
    else shape.push('junior');
  }

  // Everyone not coming with you is now somebody you used to work with.
  let next = remember(state, left);
  const staff: StaffMember[] = [...kept];

  // The people you brought fill establishment slots, so a move with two in tow arrives with two
  // fewer strangers rather than with a unit two over headcount.
  for (const seniority of shape.slice(kept.length)) {
    const made = createStaff(next, registry, seniority);
    next = made.state;

    // You are new; they are not. An inherited unit has history, and showing everyone at nought
    // months makes it read as a team that was assembled for you this morning.
    const tenure = nextInt(next.rngState, 4, 60);
    next = { ...next, rngState: tenure.rngState };
    staff.push({ ...made.staff, monthsInPost: tenure.value });
  }

  const brought =
    kept.length > 0
      ? [
          {
            turn: state.turn,
            messageKey: 'log.brought_with_you',
            params: { names: kept.map((s) => s.name).join(', ') },
            tone: 'good' as const,
          },
        ]
      : [];

  const budget: Budget = {
    monthly: post.monthlyBudget ?? 0,
    balance: 0,
    yearStartMonth: next.calendarMonth,
    spentThisMonth: 0,
  };

  return {
    ...next,
    staff,
    hiring: undefined,
    budget,
    log: [...next.log, ...brought].slice(-LOG_LIMIT),
  };
}

export function startHiring(state: GameState, seniority: Seniority): GameState {
  if (state.hiring) return state;
  return { ...state, hiring: { seniority, monthsRemaining: HIRING_MONTHS[seniority] } };
}

export function cancelHiring(state: GameState): GameState {
  return { ...state, hiring: undefined };
}

/* ---------------------------------------------------------------- output */

/**
 * What one person delivers to a file in a month.
 *
 * Skill sets the ceiling and morale decides how much of it you actually get, which is why a
 * neglected expert can be worth less than an ordinary officer who is being looked after.
 */
export function staffOutput(staff: StaffMember): number {
  const base = STAFF_BASE_OUTPUT[staff.seniority];
  const skillFactor = 0.6 + (0.8 * staff.skill) / 100;
  const moraleFactor = 0.7 + (0.6 * staff.morale) / 100;
  return Math.max(1, Math.round(base * skillFactor * moraleFactor));
}

/** The effective ability behind a delegated file, used in place of your own form. */
export function delegatedQualityBase(staff: StaffMember): number {
  return staff.skill * 0.75 + staff.morale * 0.25;
}

/* --------------------------------------------------------- monthly cycle */

export interface StaffMonthResult {
  state: GameState;
  report: TeamReport;
}

/**
 * Applies everything the unit does in a month except the task progress itself, which `turn.ts`
 * folds in alongside the player's own effort.
 */
export function resolveStaffMonth(
  state: GameState,
  registry: ContentRegistry,
  allocation: Allocation,
): StaffMonthResult {
  const report: TeamReport = { delegatedProgress: [], departures: [], arrivals: [] };

  if (!hasTeam(state, registry)) return { state, report };

  let next = state;

  // Attention: coaching builds capability, one-to-ones build willingness.
  const coached = new Set(allocation.coaching);
  const seen = new Set(allocation.oneToOnes);
  const trained = new Set(allocation.training);

  next = {
    ...next,
    staff: next.staff.map((member) => {
      let { skill, morale } = member;

      // Whichever way the office has decided pressure flows, it lands on them every month — in
      // the opposite direction to the way it lands on you.
      morale += STAFF_MORALE_DRIFT + hoursMoraleDelta(state);
      if (coached.has(member.id)) {
        skill += COACHING_SKILL_GAIN;
        morale += COACHING_MORALE_GAIN;
      }
      if (seen.has(member.id)) morale += ONE_TO_ONE_MORALE_GAIN;
      if (trained.has(member.id)) skill += TRAINING_SKILL_GAIN;

      // A slow drip of learning by doing.
      const monthsInPost = member.monthsInPost + 1;
      if (monthsInPost % 12 === 0) skill += STAFF_SKILL_DRIFT_PER_YEAR;

      return { ...member, skill: clamp(skill), morale: clamp(morale), monthsInPost };
    }),
  };

  // Recruitment.
  if (next.hiring && allocation.recruiting) {
    const remaining = next.hiring.monthsRemaining - 1;
    if (remaining <= 0) {
      const made = createStaff(next, registry, next.hiring.seniority);
      next = {
        ...made.state,
        staff: [...made.state.staff, made.staff],
        hiring: undefined,
      };
      report.arrivals.push({ name: made.staff.name, seniority: made.staff.seniority });
    } else {
      next = { ...next, hiring: { ...next.hiring, monthsRemaining: remaining } };
    }
  }

  // Promotion from within, which costs the budget a salary difference and nothing else. Somebody
  // plainly doing the next grade's job is promoted into it; not noticing is how you end up in the
  // block below instead.
  for (const member of next.staff) {
    if (member.seniority === 'senior') continue;
    if (member.skill < PROMOTION_SKILL[member.seniority]) continue;

    next = promoteStaff(next, member.id);
    report.promotions ??= [];
    report.promotions.push({ name: member.name, to: next.staff.find((s) => s.id === member.id)!.seniority });
  }

  // And the other kind of promotion: somebody good, who has noticed that the job is not worth
  // having, taking one somewhere else. Skill is what gives them the option and morale is what
  // decides whether they use it — which makes this the bill for a year of not looking after them.
  const poached: string[] = [];
  for (const member of next.staff) {
    if (member.skill < POACHING_SKILL || member.morale > POACHING_MORALE) continue;

    const roll = nextChance(next.rngState, POACHING_CHANCE);
    next = { ...next, rngState: roll.rngState };
    if (!roll.value) continue;

    poached.push(member.id);
    report.departures.push({ name: member.name, reason: 'promoted_away' });
  }

  if (poached.length > 0) {
    // Somebody good does not vanish, they go somewhere — and where they went should be a place
    // the player has heard of, or the sentence "they are at Eastmoor now" means nothing. Picking
    // the worst-run body the player knows is not arbitrary: struggling institutions are the ones
    // recruiting, and it puts your best former officer where the trouble is.
    const known = knownBodies(next, registry);
    next = remember(
      next,
      next.staff.filter((s) => poached.includes(s.id)),
      known[0]?.id,
    );
    next = {
      ...next,
      staff: next.staff.filter((s) => !poached.includes(s.id)),
      tasks: next.tasks.map((task) =>
        task.assignedTo && poached.includes(task.assignedTo)
          ? { ...task, assignedTo: undefined }
          : task,
      ),
      initiatives: next.initiatives.map((initiative) =>
        initiative.assignedTo && poached.includes(initiative.assignedTo)
          ? { ...initiative, assignedTo: undefined }
          : initiative,
      ),
    };
  }

  return { state: next, report };
}

/**
 * People leave. Low morale makes it likely; a file in their hands makes it expensive, because it
 * goes back on the board with whatever progress they had made and no one to carry it.
 */
export function resolveAttrition(
  state: GameState,
  registry: ContentRegistry,
): StaffMonthResult {
  const report: TeamReport = { delegatedProgress: [], departures: [], arrivals: [] };
  if (!hasTeam(state, registry)) return { state, report };

  let next = state;
  const leaving: string[] = [];

  for (const member of next.staff) {
    if (member.morale > STAFF_ATTRITION_MORALE) continue;

    // The worse the morale, the likelier the resignation.
    const severity = (STAFF_ATTRITION_MORALE - member.morale) / STAFF_ATTRITION_MORALE;
    const roll = nextChance(next.rngState, STAFF_ATTRITION_CHANCE * (0.5 + severity));
    next = { ...next, rngState: roll.rngState };

    if (roll.value) {
      leaving.push(member.id);
      report.departures.push({ name: member.name, reason: 'morale' });
    }
  }

  if (leaving.length === 0) return { state: next, report };

  // Somebody who resigns is not gone from the career, only from the unit.
  next = remember(
    next,
    next.staff.filter((s) => leaving.includes(s.id)),
  );

  return {
    state: {
      ...next,
      staff: next.staff.filter((s) => !leaving.includes(s.id)),
      // Whatever they were holding lands back on your desk, unassigned.
      tasks: next.tasks.map((task) =>
        task.assignedTo && leaving.includes(task.assignedTo)
          ? { ...task, assignedTo: undefined }
          : task,
      ),
    },
    report,
  };
}

/* ---------------------------------------------------------------- budget */

export function staffCost(state: GameState): number {
  return state.staff.reduce((sum, member) => sum + member.salary, 0);
}

export interface BudgetResult {
  state: GameState;
  delta: number;
  verdict?: 'overspent' | 'underspent';
}

/**
 * Charges the month to the budget and, once a year, judges the result.
 *
 * Both directions of failure are punished. Overspending is the obvious one. Underspending costs
 * you too, and costs you next year's allocation, because a budget you did not need is a budget
 * you will not be given again — which is exactly why public bodies spend their remainder in
 * December.
 */
export function resolveBudget(state: GameState, discretionarySpend: number): BudgetResult {
  if (!state.budget) return { state, delta: 0 };

  const spend = staffCost(state) + Math.max(0, discretionarySpend);
  const delta = state.budget.monthly - spend;

  let budget: Budget = {
    ...state.budget,
    balance: state.budget.balance + delta,
    spentThisMonth: 0,
  };
  let next: GameState = { ...state, budget };
  let verdict: 'overspent' | 'underspent' | undefined;

  const monthsElapsed = next.calendarMonth - budget.yearStartMonth;
  if (monthsElapsed >= BUDGET_YEAR_MONTHS) {
    const annual = budget.monthly * BUDGET_YEAR_MONTHS;
    const stats = { ...next.stats };

    if (budget.balance < -annual * BUDGET_OVERSPEND_TOLERANCE) {
      verdict = 'overspent';
      stats.reputation = clamp(stats.reputation + BUDGET_OVERSPEND_REPUTATION);
    } else if (budget.balance > annual * BUDGET_UNDERSPEND_TOLERANCE) {
      verdict = 'underspent';
      stats.reputation = clamp(stats.reputation + BUDGET_UNDERSPEND_REPUTATION);
      budget = { ...budget, monthly: Math.round(budget.monthly * (1 - BUDGET_UNDERSPEND_CUT)) };
    }

    budget = { ...budget, balance: 0, yearStartMonth: next.calendarMonth };
    next = { ...next, stats, budget };
  }

  return { state: next, delta, verdict };
}

/* ------------------------------------------------------------ assignment */

/** Records who is carrying what, dropping assignments to people who are no longer here. */
export function applyAssignments(state: GameState, allocation: Allocation): GameState {
  const present = new Set(state.staff.map((s) => s.id));

  return {
    ...state,
    tasks: state.tasks.map((task) => {
      const assignee = allocation.delegations[task.uid];
      if (assignee && present.has(assignee)) return { ...task, assignedTo: assignee };
      return task.assignedTo ? { ...task, assignedTo: undefined } : task;
    }),
  };
}

/** Moves a staff member up a grade — the reward for coaching someone well. */
export function promoteStaff(state: GameState, staffId: string): GameState {
  return {
    ...state,
    staff: state.staff.map((member) => {
      if (member.id !== staffId) return member;
      const nextGrade: Seniority =
        member.seniority === 'junior' ? 'officer' : member.seniority === 'officer' ? 'senior' : 'senior';
      return {
        ...member,
        seniority: nextGrade,
        salary: STAFF_SALARY[nextGrade],
        morale: clamp(member.morale + 12),
      };
    }),
  };
}

/** Adjusts one person's morale, for events that land on an individual. */
export function adjustStaffMorale(state: GameState, staffId: string, delta: number): GameState {
  return {
    ...state,
    staff: state.staff.map((member) =>
      member.id === staffId ? { ...member, morale: clamp(member.morale + delta) } : member,
    ),
  };
}

/** Adjusts the whole unit's morale, for events that land on everyone. */
export function adjustTeamMorale(state: GameState, delta: number): GameState {
  return {
    ...state,
    staff: state.staff.map((member) => ({ ...member, morale: clamp(member.morale + delta) })),
  };
}

export function averageMorale(state: GameState): number {
  if (state.staff.length === 0) return 0;
  return Math.round(state.staff.reduce((sum, s) => sum + s.morale, 0) / state.staff.length);
}

export function averageSkill(state: GameState): number {
  if (state.staff.length === 0) return 0;
  return Math.round(state.staff.reduce((sum, s) => sum + s.skill, 0) / state.staff.length);
}
