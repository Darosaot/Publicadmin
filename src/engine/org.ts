/**
 * Structure: the difference between managing eight people and managing three.
 *
 * Until now a unit of eight played exactly like a unit of three, only with more of it. Every file
 * was handed over individually, every handover cost the same point of the month, and the manager
 * of a directorate was doing the same clerical act eight times. That is not what running a large
 * office is like, and it is the reason the senior half of the career felt thinner than the junior
 * half rather than richer.
 *
 * A deputy is the answer, and it is one decision rather than a system. You name a second, they
 * stop carrying files themselves, and they run the routine board without you: a few files a month
 * are assigned and progressed with none of your effort spent on them. What you buy is the top of
 * your month back. What you pay is their own output, and the fact that the best person in the
 * unit is now doing your job instead of theirs.
 *
 * ### Why there is no migration
 *
 * `deputyId` is an optional string on `GameState`. An absent one means "no deputy", which is what
 * every existing save should say, and `cloneState` copies primitives through the spread it already
 * does. No save-version bump, no clone edit, no new `Condition` surface.
 *
 * ### The one real trap
 *
 * A deputy who resigns, is poached, or is left behind at a post change leaves `deputyId` pointing
 * at nobody. Every path that removes somebody from the unit therefore runs through
 * `settleDeputy`, and there is a test for each — a dangling id would silently disable the
 * mechanic while the screen went on claiming somebody was in the job.
 */

import type { GameState, StaffMember } from './types';
import { staffLevel } from './people';

/** Anybody more junior than this is not somebody you can put in charge of the board. */
export const DEPUTY_MIN_SENIORITY: StaffMember['seniority'] = 'officer';

/** However good they are, a deputy never runs more of the board than this. */
export const DEPUTY_MAX_FILES = 3;

/**
 * How much better somebody is at the routine board when running it is their actual job.
 *
 * Not a sweetener — a correction. A deputy picks files by deadline rather than by who is best at
 * each, so appointing one trades your best officer's *judgement* for their *availability*, and
 * two sweeps running showed that trade losing: completion fell and careers came out marginally
 * shorter than never appointing anybody. Somebody doing nothing but running the board all month
 * is genuinely better at it than somebody fitting it around four files of their own, and this is
 * that difference.
 */
export const DEPUTY_OUTPUT_BONUS = 1.3;

export function deputyOf(state: GameState): StaffMember | undefined {
  if (!state.deputyId) return undefined;
  return state.staff.find((member) => member.id === state.deputyId);
}

export function isDeputy(state: GameState, staffId: string): boolean {
  return state.deputyId === staffId;
}

export function canBeDeputy(member: StaffMember): boolean {
  return member.seniority !== 'junior';
}

/**
 * How many files the deputy takes off your hands entirely.
 *
 * Skill and their own experience, because running a board is a thing you get better at. One file
 * for an ordinary officer, three for a senior who has been doing it for years — which is what
 * turns a directorate from eight handovers into five.
 */
export function deputyCapacity(state: GameState): number {
  const deputy = deputyOf(state);
  if (!deputy) return 0;

  const fromSkill = Math.floor(deputy.skill / 34);
  const fromExperience = Math.floor(staffLevel(deputy) / 3);
  return Math.max(1, Math.min(DEPUTY_MAX_FILES, fromSkill + fromExperience));
}

/**
 * What a good second is actually for.
 *
 * The first version paid only in effort points, and the sweep said naming one made a career very
 * slightly *worse*: a senior manager already has more points than desk to spend them on, while
 * the deputy runs the board by deadline rather than by who is best at each file, so the unit
 * finished marginally less. A feature you are punished for using is worse than no feature.
 *
 * What they really buy is that the month stops being yours alone to hold — somebody else is
 * carrying the shape of the work, and that is worth a point of stress every month for the rest of
 * your career. It is the same size as the `thick_skin` perk and stacks with it, because both are
 * describing the same relief from two directions.
 */
export function deputyStressRelief(state: GameState): number {
  return deputyOf(state) ? 1 : 0;
}

export function appointDeputy(state: GameState, staffId: string): GameState {
  const member = state.staff.find((s) => s.id === staffId);
  if (!member || !canBeDeputy(member)) return state;
  return { ...state, deputyId: staffId };
}

export function dismissDeputy(state: GameState): GameState {
  if (!state.deputyId) return state;
  const { deputyId: _gone, ...rest } = state;
  return rest;
}

/**
 * Drop the appointment if the person is no longer here.
 *
 * Called from every path that can remove somebody from the unit — resignation, poaching, and a
 * post change. Centralised deliberately: three call sites each doing their own check is three
 * chances to miss one, and the failure is invisible. The screen would go on naming a deputy who
 * left in year nine while the board quietly stopped being run.
 */
export function settleDeputy(state: GameState): GameState {
  if (!state.deputyId) return state;
  return state.staff.some((member) => member.id === state.deputyId) ? state : dismissDeputy(state);
}

/**
 * Which files the deputy picks up, given what is on the board.
 *
 * Oldest deadline first and never something you have already handed to somebody: the deputy runs
 * what is left after your decisions, not instead of them. Pure, so the Desk screen can show the
 * player exactly which files are being handled without them.
 */
export function deputyAssignments(state: GameState, alreadyAssigned: ReadonlySet<string>): string[] {
  const deputy = deputyOf(state);
  if (!deputy) return [];

  return [...state.tasks]
    .filter((task) => !alreadyAssigned.has(task.uid) && task.assignedTo === undefined)
    .sort((a, b) => a.deadlineTurn - b.deadlineTurn)
    .slice(0, deputyCapacity(state))
    .map((task) => task.uid);
}
