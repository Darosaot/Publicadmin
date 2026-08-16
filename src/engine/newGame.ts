/** Building a fresh career. */

import { SAVE_VERSION, STARTING_STATS } from './constants';
import { adjustStat } from './effects';
import { startingPost, type ContentRegistry } from './registry';
import { seedToState } from './rng';
import { refillBoard } from './tasks';
import { learnLocalBodies } from './world';
import type { DepartmentId, GameState, PlayerStats, StatId } from './types';

export interface NewGameOptions {
  name: string;
  department: DepartmentId;
  seed?: number;
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2_147_483_647);
}

export function createGame(options: NewGameOptions, registry: ContentRegistry): GameState {
  const seed = options.seed ?? randomSeed();
  const start = startingPost(registry);

  const stats: PlayerStats = { ...STARTING_STATS };
  const department = registry.departments[options.department];
  for (const [stat, delta] of Object.entries(department.startingAdjustments) as [
    StatId,
    number,
  ][]) {
    adjustStat(stats, stat, delta);
  }

  const state: GameState = {
    saveVersion: SAVE_VERSION,
    seed,
    rngState: seedToState(seed),

    turn: 1,
    calendarMonth: 0,
    phase: 'allocation',

    player: {
      name: options.name.trim() || 'Alex Moreau',
      department: options.department,
      postId: start.id,
      level: start.tier,
      track: start.track,
      turnsAtLevel: 0,
      salary: start.baseSalary,
    },

    stats,

    tasks: [],
    nextTaskUid: 1,

    // Nothing started. The menu is what the first management post is really for.
    initiatives: [],

    // Nobody has worked for you yet.
    alumni: [],

    // No unit until the first management post.
    staff: [],
    nextStaffUid: 1,

    pendingEvents: [],
    scheduledEvents: [],
    firedEvents: [],
    cooldowns: {},
    flags: {},

    offers: [],

    sinceReview: { completed: 0, failed: 0 },
    lastReviewTurn: 0,

    log: [
      {
        turn: 1,
        messageKey: 'log.career_started',
        params: { org: start.orgShortKey, department: department.nameKey },
        tone: 'neutral',
      },
    ],
  };

  return refillBoard(learnLocalBodies(state, registry), registry);
}
