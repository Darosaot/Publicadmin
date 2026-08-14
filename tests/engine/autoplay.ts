/**
 * A bot that plays whole careers.
 *
 * This is the balancing instrument. Tuning a game like this by hand means playing it for an hour
 * to find out that promotions arrive four years too late; the bot plays two hundred careers in a
 * second and reports the distribution, so `constants.ts` can be tuned against evidence.
 *
 * The strategy is deliberately "competent but not optimal" — roughly what an engaged player does
 * on a first run: keep the urgent files moving, rest before burning out, network when the next
 * post needs allies.
 */

import { registry } from '../../src/content';
import {
  AGENCY_TEMP_COST,
  AGENCY_TEMP_EFFORT,
  AGENCY_TEMP_MAX,
  COACHING_EFFORT_COST,
  DELEGATION_EFFORT_COST,
  MINISTER_MIN_POLITICAL_CAPITAL,
  ONE_TO_ONE_EFFORT_COST,
  RECRUITING_EFFORT_COST,
  TRAINING_COST,
} from '../../src/engine/constants';
import { isChoiceAvailable } from '../../src/engine/events';
import { createGame } from '../../src/engine/newGame';
import { nextInt, seedToState } from '../../src/engine/rng';
import { getCareerLevel } from '../../src/engine/registry';
import { averageMorale, headcountFor, staffCost, staffOutput, startHiring } from '../../src/engine/team';
import {
  acceptOffer,
  beginNextTurn,
  chooseEventOption,
  continueAfterEvent,
  effortAvailable,
  emptyAllocation,
  resolveTurn,
} from '../../src/engine/turn';
import type {
  Allocation,
  Choice,
  DepartmentId,
  EndingId,
  GameState,
} from '../../src/engine/types';

export interface RunResult {
  seed: number;
  department: DepartmentId;
  turns: number;
  level: number;
  ending?: EndingId;
  stats: GameState['stats'];
  salary: number;
  promotions: number;
  tasksCompleted: number;
  tasksFailed: number;
}

const REST_THRESHOLD = 62;

/**
 * How the bot plays.
 *
 * `balanced` is the one used for tuning — roughly an engaged player on a first run. The other two
 * exist to prove that the endings they aim at are actually reachable: an ending no strategy can
 * reach is a content bug, and only a bot will find that out reliably.
 */
export type Strategy = 'balanced' | 'ruthless' | 'reckless';

/** Decides how to spend the month. */
function planAllocation(game: GameState, strategy: Strategy): Allocation {
  const allocation: Allocation = emptyAllocation();

  // The reckless bot never rests and always works overtime. It is trying to burn out.
  const overtime = strategy === 'reckless';
  allocation.overtime = overtime;
  let budget = effortAvailable(game, registry, overtime);

  /* ------------------------------------------------------------ managing */

  // Once there is a unit, most of the month's value comes from running it rather than from
  // doing the work personally. A manager who behaves like a senior officer drowns, which the
  // first balance run after the office landed demonstrated rather forcefully.
  const managing = game.staff.length > 0;
  if (managing && strategy !== 'reckless') {
    const morale = averageMorale(game);

    // Keep the worst-off person from walking out.
    const lowest = [...game.staff].sort((a, b) => a.morale - b.morale)[0];
    if (lowest && (morale < 62 || lowest.morale < 45) && budget >= ONE_TO_ONE_EFFORT_COST) {
      allocation.oneToOnes.push(lowest.id);
      budget -= ONE_TO_ONE_EFFORT_COST;
    }

    // Keep the vacancy moving.
    if (game.hiring && budget >= RECRUITING_EFFORT_COST) {
      allocation.recruiting = true;
      budget -= RECRUITING_EFFORT_COST;
    }

    // Hand out the files, strongest people onto the tightest deadlines.
    const byOutput = [...game.staff].sort((a, b) => staffOutput(b) - staffOutput(a));
    const byDeadline = [...game.tasks].sort((a, b) => a.deadlineTurn - b.deadlineTurn);
    for (let i = 0; i < byOutput.length && i < byDeadline.length; i += 1) {
      if (budget < DELEGATION_EFFORT_COST) break;
      allocation.delegations[byDeadline[i]!.uid] = byOutput[i]!.id;
      budget -= DELEGATION_EFFORT_COST;
    }

    // Invest in someone if there is room left in the month.
    const weakest = [...game.staff].sort((a, b) => a.skill - b.skill)[0];
    if (weakest && budget >= COACHING_EFFORT_COST + 3) {
      allocation.coaching.push(weakest.id);
      budget -= COACHING_EFFORT_COST;
    }

    // Spend the budget. An allocation you did not need is one you will not be given again, so
    // the slack goes on training rather than back to the centre.
    const unit = game.budget;
    if (unit) {
      const slack = unit.monthly - staffCost(game);
      let toSpend = Math.max(0, slack);
      const trainable = [...game.staff].sort((a, b) => a.skill - b.skill);
      for (const member of trainable) {
        if (toSpend < TRAINING_COST) break;
        allocation.training.push(member.id);
        toSpend -= TRAINING_COST;
      }
      if (toSpend >= AGENCY_TEMP_COST) {
        allocation.agencyTemps = Math.min(
          AGENCY_TEMP_MAX,
          Math.floor(toSpend / AGENCY_TEMP_COST),
        );
        budget += allocation.agencyTemps * AGENCY_TEMP_EFFORT;
      }
    }
  }

  // Look after yourself before the wheels come off.
  if (strategy !== 'reckless' && game.stats.stress >= REST_THRESHOLD) {
    const rest = Math.min(3, budget);
    allocation.rest = rest;
    budget -= rest;
  }

  // Build allies when the next post will ask for them — and at the top of the ladder, where the
  // only thing left to climb is the Minister threshold.
  const nextLevel = registry.careerLevels.find((l) => l.level === game.player.level + 1);
  const needsCapital = nextLevel
    ? (nextLevel.promotion?.minPoliticalCapital ?? 0)
    : MINISTER_MIN_POLITICAL_CAPITAL;

  if (budget > 2 && game.stats.politicalCapital < needsCapital) {
    // Capital decays, so holding a level costs a point a month before any of it accumulates.
    const network = Math.min(2, budget - 2);
    allocation.networking = network;
    budget -= network;
  }

  // Then the work: soonest deadline first, and only start what can be finished.
  const byUrgency = [...game.tasks].sort((a, b) => a.deadlineTurn - b.deadlineTurn);
  for (const task of byUrgency) {
    if (budget <= 0) break;
    const needed = Math.max(0, task.required - task.progress);
    const monthsLeft = Math.max(1, task.deadlineTurn - game.turn + 1);
    // Spread the remaining work across the months available, rounding up.
    const thisMonth = Math.min(budget, Math.max(1, Math.ceil(needed / monthsLeft)));
    if (thisMonth > 0) {
      allocation.tasks[task.uid] = thisMonth;
      budget -= thisMonth;
    }
  }

  // Anything left over goes onto the most urgent file rather than being wasted.
  const first = byUrgency[0];
  if (budget > 0 && first) {
    allocation.tasks[first.uid] = (allocation.tasks[first.uid] ?? 0) + budget;
  }

  return allocation;
}

/** The integrity a choice is most likely to cost, used by the ruthless strategy. */
function integritySwing(choice: Choice): number {
  let worst = 0;
  for (const outcome of choice.outcomes) {
    for (const effect of outcome.effects) {
      if (effect.kind === 'stat' && effect.stat === 'integrity') {
        worst = Math.min(worst, effect.delta);
      }
    }
  }
  return worst;
}

/** Picks a decision from the options actually open to the player. */
function decide(
  game: GameState,
  botState: number,
  strategy: Strategy,
): { choiceId: string; botState: number } {
  const pending = game.pendingEvents[0]!;
  const event = registry.events[pending.eventId]!;
  const available = event.choices.filter((choice) => isChoiceAvailable(game, choice));
  const pool = available.length > 0 ? available : event.choices;

  if (strategy === 'ruthless') {
    // Always take the option that costs the most integrity: the corrupt path, played to the end.
    const worst = [...pool].sort((a, b) => integritySwing(a) - integritySwing(b))[0]!;
    return { choiceId: worst.id, botState };
  }

  const roll = nextInt(botState, 0, pool.length - 1);
  return { choiceId: pool[roll.value]!.id, botState: roll.rngState };
}

export function playCareer(
  seed: number,
  department: DepartmentId,
  strategy: Strategy = 'balanced',
  maxTurns = 200,
): RunResult {
  let game = createGame({ name: 'Bot', department, seed }, registry);
  // A second stream so the bot's decisions do not consume the game's randomness.
  let botState = seedToState(seed ^ 0x5f3759df);

  let promotions = 0;
  let tasksCompleted = 0;
  let tasksFailed = 0;
  let guard = 0;

  while (!game.ending && guard < maxTurns * 12) {
    guard += 1;

    switch (game.phase) {
      case 'allocation': {
        // Take any post on offer: the bot is ambitious.
        const offer = game.offers[0];
        if (offer) {
          game = acceptOffer(game, registry, offer.id);
          promotions += 1;
          break;
        }

        // Fill the establishment. A unit below headcount is a unit whose budget will be judged
        // underspent, on top of being short of hands.
        const establishment = headcountFor(game, registry);
        if (
          strategy !== 'reckless' &&
          establishment > 0 &&
          !game.hiring &&
          game.staff.length < establishment
        ) {
          game = startHiring(game, game.staff.length < establishment - 1 ? 'officer' : 'senior');
        }
        game = resolveTurn(game, registry, planAllocation(game, strategy));
        tasksCompleted += game.lastReport?.completed.length ?? 0;
        tasksFailed += game.lastReport?.failed.length ?? 0;
        break;
      }

      case 'event': {
        const pending = game.pendingEvents[0];
        if (!pending) {
          game = continueAfterEvent(game, registry);
          break;
        }
        if (!pending.resolution) {
          const decision = decide(game, botState, strategy);
          botState = decision.botState;
          game = chooseEventOption(game, registry, pending.eventId, decision.choiceId);
        } else {
          game = continueAfterEvent(game, registry);
        }
        break;
      }

      case 'report':
        game = beginNextTurn(game, registry);
        break;

      default:
        guard = Number.MAX_SAFE_INTEGER;
        break;
    }

    if (game.turn > maxTurns) break;
  }

  return {
    seed,
    department,
    turns: game.turn,
    level: game.player.level,
    ending: game.ending,
    stats: game.stats,
    salary: game.player.salary,
    promotions,
    tasksCompleted,
    tasksFailed,
  };
}

export function playMany(
  seeds: number[],
  departments: readonly DepartmentId[],
  strategy: Strategy = 'balanced',
): RunResult[] {
  const results: RunResult[] = [];
  for (const department of departments) {
    for (const seed of seeds) {
      results.push(playCareer(seed, department, strategy));
    }
  }
  return results;
}

export function summarise(results: RunResult[]) {
  const byEnding: Record<string, number> = {};
  const byLevel: Record<number, number> = {};

  for (const result of results) {
    const ending = result.ending ?? 'unfinished';
    byEnding[ending] = (byEnding[ending] ?? 0) + 1;
    byLevel[result.level] = (byLevel[result.level] ?? 0) + 1;
  }

  const mean = (pick: (r: RunResult) => number) =>
    results.reduce((sum, r) => sum + pick(r), 0) / results.length;

  return {
    runs: results.length,
    byEnding,
    byLevel,
    meanTurns: mean((r) => r.turns),
    meanLevel: mean((r) => r.level),
    meanReputation: mean((r) => r.stats.reputation),
    meanStress: mean((r) => r.stats.stress),
    meanIntegrity: mean((r) => r.stats.integrity),
    meanPoliticalCapital: mean((r) => r.stats.politicalCapital),
    meanSalary: mean((r) => r.salary),
    completionRate: mean((r) =>
      r.tasksCompleted + r.tasksFailed === 0
        ? 1
        : r.tasksCompleted / (r.tasksCompleted + r.tasksFailed),
    ),
  };
}

export function getCareerTitle(level: number): string {
  return getCareerLevel(registry, level).titleKey;
}
