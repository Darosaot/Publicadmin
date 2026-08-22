/**
 * The people in your unit, as individuals rather than as three numbers each.
 *
 * v1 gave every officer a skill, a morale and a grade, which is enough to run a spreadsheet and
 * not enough to remember anybody. This adds the two things that make a unit a cast: what each
 * person is actually *good at*, and what they are *like*.
 *
 * ### Why neither of them is stored
 *
 * A specialism and a trait are pure functions of the person's name, exactly as their face is.
 * That buys three things at once:
 *
 * - **The migration invents nothing.** Every officer in an existing save gets a specialism and a
 *   trait that are as true as if they had always had them, without a single field of guessed
 *   data — the alternative being to roll for forty people and write a history that never happened.
 * - **The cast is consistent.** Tomas Bergqvist is a procurement man with an eye for detail in
 *   every career you play, the same way he has the same face. A unit you have met before is worth
 *   more than one reshuffled each time.
 * - **The save does not grow.** Only experience actually accumulates, so only experience is kept.
 *
 * ### Why experience is the one thing kept
 *
 * It is the only one that changes. A person's aptitude does not move over thirty years; what they
 * have done does, and that is what turns an anxious junior into somebody the unit relies on.
 */

import { DELEGATION_CAPACITY } from './constants';
import { DEPARTMENT_IDS, type DepartmentId, type StaffMember, type TaskTemplate } from './types';

/**
 * What somebody is like to work with.
 *
 * Six of them, each with exactly one mechanical hook, and none of them strictly better than
 * another. `restless` is the clearest case: it is a worse colleague and a faster learner, which
 * is a real person and a real management problem.
 */
export const STAFF_TRAITS = [
  'meticulous',
  'quick',
  'steady',
  'restless',
  'organiser',
  'diplomat',
] as const;
export type StaffTrait = (typeof STAFF_TRAITS)[number];

/**
 * Months of carrying real work before somebody is visibly better at it.
 *
 * Ten, not eighteen. Eighteen was the first guess and the sweep put the average unit's best
 * officer at level 1.4 across a whole career — people move on, and a post change replaces the
 * unit, so almost nobody was ever handed files for a year and a half running. A levelling system
 * that fires twice in thirty years is decoration.
 */
export const XP_PER_LEVEL = 10;
export const MAX_STAFF_LEVEL = 5;
/** Skill gained each time they level. Permanent, and shows on the bar the roster already has. */
export const STAFF_LEVEL_SKILL_GAIN = 4;

/** Same fold as the portrait generator, for the same reason: one letter must change everything. */
function seedFrom(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * The work they are actually good at.
 *
 * Rolled at hire, weighted toward the department the player works in — see `SPECIALIST_HIRE_CHANCE`.
 * A unit is still a mix, because the rest of the roll is uniform across the country, but it is a
 * mix with a centre of gravity: roughly half your people know your own work, and the others are
 * ordinary officers who become noticeably better the day a file from their field lands.
 */
export function specialismOf(member: StaffMember): DepartmentId {
  return member.specialism;
}

/**
 * What somebody's field would have been if nobody had rolled for it.
 *
 * Used only by the v6 migration, so an officer hired years before specialisms existed comes back
 * with one that is stable and plausible rather than invented afresh on every load — and the same
 * one in every save of that career.
 */
export function specialismFromName(name: string): DepartmentId {
  return DEPARTMENT_IDS[seedFrom(name) % DEPARTMENT_IDS.length]!;
}

export function traitOf(member: StaffMember): StaffTrait {
  // A second, differently-salted fold: seeded off the same number, specialism and trait would be
  // perfectly correlated and there would only really be nine kinds of person in the game.
  const index = seedFrom(`${member.name}::trait`) % STAFF_TRAITS.length;
  return STAFF_TRAITS[index]!;
}

export function staffLevel(member: StaffMember): number {
  return Math.min(MAX_STAFF_LEVEL, Math.floor(member.xp / XP_PER_LEVEL) + 1);
}

/** Experience toward the next level, and what it takes — for a bar that has to fill. */
export function levelProgress(member: StaffMember): { current: number; needed: number } {
  if (staffLevel(member) >= MAX_STAFF_LEVEL) return { current: XP_PER_LEVEL, needed: XP_PER_LEVEL };
  return { current: member.xp % XP_PER_LEVEL, needed: XP_PER_LEVEL };
}

/* ------------------------------------------------------------------- hooks */

/**
 * How much more they get done when the file is in their own field.
 *
 * A multiplier rather than a flat bonus, because it has to stay meaningful for a senior officer
 * as well as a junior. `departments: 'any'` templates are nobody's specialism — general work is
 * general work.
 */
export function specialismFactor(member: StaffMember, template: TaskTemplate): number {
  if (template.departments === 'any') return 1;
  return template.departments.includes(specialismOf(member)) ? 1.3 : 1;
}

export function traitOutputFactor(member: StaffMember): number {
  const trait = traitOf(member);
  if (trait === 'quick') return 1.15;
  if (trait === 'meticulous') return 0.92;
  return 1;
}

/** Meticulous work is better work; quick work is not. */
export function traitQualityDelta(member: StaffMember): number {
  const trait = traitOf(member);
  if (trait === 'meticulous') return 6;
  if (trait === 'quick') return -5;
  return 0;
}

/**
 * How the monthly slide treats somebody in particular.
 *
 * `steady` resists only once things are already going badly, which is both what its description
 * promises — holding their level through a bad year — and the only version that works. Cancelling
 * `STAFF_MORALE_DRIFT` outright meant a unit of steady officers never decayed at all, switching
 * off the attrition the whole office game rests on; the existing "morale rots when nobody is
 * looked after" guardrail caught it immediately.
 */
export function traitMoraleDrift(member: StaffMember): number {
  const trait = traitOf(member);
  if (trait === 'steady') return member.morale < STEADY_THRESHOLD ? 1 : 0;
  if (trait === 'restless') return -1;
  return 0;
}

/** The restless learn faster than the people who are easier to manage. */
export function traitSkillGrowth(member: StaffMember): number {
  return traitOf(member) === 'restless' ? 2 : 0;
}

export function capacityOf(member: StaffMember): number {
  return DELEGATION_CAPACITY[member.seniority] + (traitOf(member) === 'organiser' ? 1 : 0);
}

/** Below this, a diplomat in the room stops things getting any worse on their own. */
export const DIPLOMAT_FLOOR = 45;

/** Below this, a steady officer stops sliding on their own. Above it they slide like anyone. */
export const STEADY_THRESHOLD = 50;

/**
 * A diplomat holds the room together, and only the room — never themselves.
 *
 * A *floor* rather than a monthly point, and the difference is the whole mechanic. The first
 * draft added one morale a month to everybody else, which exactly cancels `STAFF_MORALE_DRIFT`:
 * hiring a single diplomat switched off attrition for the entire unit and the existing guardrail
 * for "morale rots when nobody is looked after" went red on the spot. What they actually do is
 * stop a bad month becoming a resignation — the unit still slides, it just does not fall apart.
 */
export function diplomatFloor(staff: readonly StaffMember[], member: StaffMember): number {
  const present = staff.some((other) => other.id !== member.id && traitOf(other) === 'diplomat');
  return present ? DIPLOMAT_FLOOR : 0;
}
