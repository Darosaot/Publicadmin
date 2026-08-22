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
import { directiveFlag } from '../../src/engine/directives';
import { isChoiceAvailable } from '../../src/engine/events';
import {
  cycleCap,
  lapsedFlag,
  startInitiative,
  startableInitiatives,
} from '../../src/engine/initiatives';
import { createGame } from '../../src/engine/newGame';
import { nextInt, seedToState } from '../../src/engine/rng';
import { getPost, postsFrom } from '../../src/engine/registry';
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
import { extendDeadline, scopeDown } from '../../src/engine/negotiate';
import { appointDeputy, canBeDeputy, deputyOf } from '../../src/engine/org';
import { specialismFactor, staffLevel } from '../../src/engine/people';
import { canTakePerk, perkCost, takePerk, takenPerks } from '../../src/engine/perks';
import type {
  Allocation,
  Choice,
  DepartmentId,
  EndingId,
  GameState,
  PerkBranch,
  StaffMember,
  TrackId,
} from '../../src/engine/types';

export interface RunResult {
  /** The career as it finished, for tooling that wants to inspect or serialise it. */
  finalState: GameState;
  seed: number;
  department: DepartmentId;
  /** Which branch of the tree the career ended on. */
  track: TrackId;
  postId: string;
  turns: number;
  /** Calendar months the career actually covered, which is not the turn count. */
  months: number;
  level: number;
  ending?: EndingId;
  stats: GameState['stats'];
  salary: number;
  promotions: number;
  tasksCompleted: number;
  tasksFailed: number;
  /** The new verb, counted so a guardrail can tell whether the bot ever actually used it. */
  initiativesStarted: number;
  perksTaken: number;
  /**
   * Average unit morale across every month the career had a unit.
   *
   * Recorded because the people branch of the perk tree pays in morale and retention, and none of
   * the other metrics can see it — a career's final morale is often zero simply because the last
   * post had no unit. Without this the "is every branch worth taking?" guardrail would have been
   * measuring promotion velocity three times and reporting the people branch as worthless.
   */
  meanUnitMorale: number;
  /**
   * The highest level anybody in the unit reached, and how often a file went to somebody whose
   * field it was.
   *
   * Both are counted *during* the run because neither survives to the end of one: a career's
   * final unit was hired at its last post change, so everybody in it is new and unblooded, and
   * the board in the final state has been refilled with nothing assigned yet. Measuring either at
   * `finalState` reads zero however well the mechanic works — which is exactly what the first
   * version of these guardrails did.
   */
  peakStaffLevel: number;
  /** Months of the career spent with somebody running the board. */
  monthsWithDeputy: number;
  /** How often the bot argued about a file rather than simply missing it. */
  negotiations: number;
  specialistMatches: number;
  delegationsMade: number;
  initiativesCompleted: number;
  initiativesLapsed: number;
}

/**
 * How a career is played.
 *
 * An options object rather than the seven positional parameters this was heading towards. The
 * immediate reason is `useInitiatives`: the balance guardrail has to run the *same seeds* with the
 * feature on and off, and a boolean in seventh position is unreadable at every call site.
 */

/**
 * Spend whatever points are in hand, cheapest affordable perk first.
 *
 * Cheapest-first rather than deepest-first on purpose. A bot that saves for capstones spends most
 * of a career holding unspent points, which measures patience rather than the perk tree — and the
 * A/B would then report that perks barely matter because the bot never had any.
 */
function spendPerkPoints(state: GameState, branch?: PerkBranch): GameState {
  let game = state;

  for (let guard = 0; guard < registry.perks.length; guard += 1) {
    const affordable = registry.perks
      .filter((perk) => branch === undefined || perk.branch === branch)
      .filter((perk) => canTakePerk(game, registry, perk.id))
      .sort((a, b) => perkCost(a) - perkCost(b));

    const next = affordable[0];
    if (!next) break;
    game = takePerk(game, registry, next.id);
  }

  return game;
}

export interface CareerOptions {
  seed: number;
  department: DepartmentId;
  strategy?: Strategy;
  maxTurns?: number;
  /** Stop as soon as this tier is reached, rather than playing the career out. */
  stopAtLevel?: number;
  /**
   * Which branch to take when the tree forks.
   *
   * Left undefined the bot climbs by money, which is what an ambitious player does by default and
   * which keeps the headline balance figure comparable with the old single ladder. Set it to
   * measure one branch on its own — every track has to be survivable, and none may be a walkover.
   */
  preferredTrack?: TrackId;
  /** Off is the A side of the A/B: the same careers as before initiatives existed. */
  useInitiatives?: boolean;
  /** Likewise for the house rules. */
  useDirectives?: boolean;
  /**
   * And for perks, which are the riskiest of the three to measure.
   *
   * Directives are symmetrical trades and initiatives cost the months they pay for. A perk is a
   * pure upgrade with no downside at all, so the A/B on identical seeds is the only thing
   * standing between "the career feels better" and "every career is now two tiers longer".
   */
  usePerks?: boolean;
  /** Which column the bot spends down. Left undefined it takes the cheapest thing available. */
  perkBranch?: PerkBranch;
  /**
   * Whether the bot hands a file to whoever is best at *that* file, or simply to whoever is
   * strongest. Off is the A side: the policy as it was before people had specialisms, which is
   * the only honest baseline for "does matching actually match".
   */
  matchSpecialisms?: boolean;
  /**
   * Whether the bot names a second once its unit is big enough to want one.
   *
   * Off is the A side: every file handed over individually, which is how the whole senior half of
   * the career played before v2.3.
   */
  useDeputy?: boolean;
  /**
   * Whether the bot argues about files it is going to miss, rather than simply missing them.
   *
   * Off is the A side: the board as an immovable fact, which is how every version of this game
   * before v2.4 worked.
   */
  useNegotiation?: boolean;
}

const REST_THRESHOLD = 62;

/** Favours the bot will not spend on files, because promotions are keyed off the same stat. */
const NEGOTIATION_RESERVE = 45;

/**
 * How the bot plays.
 *
 * `balanced` is the one used for tuning — roughly an engaged player on a first run. The other two
 * exist to prove that the endings they aim at are actually reachable: an ending no strategy can
 * reach is a content bug, and only a bot will find that out reliably.
 */
export type Strategy = 'balanced' | 'ruthless' | 'reckless';

/** Decides how to spend the month. */
function planAllocation(
  game: GameState,
  strategy: Strategy,
  useInitiatives: boolean,
  matchSpecialisms = true,
): Allocation {
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

    /*
     * Hand out the files: tightest deadline first, and to whoever is actually best at *that* file.
     *
     * The old policy sorted by raw output and paired the lists off, which ignored specialisms
     * entirely — so the thirty per cent a procurement officer brings to a procurement file only
     * ever landed by accident, and the sweep would have reported the mechanic as worthless while
     * any human player was using it deliberately.
     */
    const byOutput = [...game.staff].sort((a, b) => staffOutput(b) - staffOutput(a));
    const byDeadline = [...game.tasks].sort((a, b) => a.deadlineTurn - b.deadlineTurn);
    const handed = new Set<string>();

    for (const task of byDeadline) {
      if (budget < DELEGATION_EFFORT_COST) break;

      const template = registry.tasks[task.templateId];
      const fit = (member: StaffMember) =>
        matchSpecialisms && template ? specialismFactor(member, template) : 1;
      const best = byOutput
        .filter((member) => !handed.has(member.id))
        .sort((a, b) => staffOutput(b) * fit(b) - staffOutput(a) * fit(a))[0];

      if (!best) break;
      allocation.delegations[task.uid] = best.id;
      handed.add(best.id);
      budget -= DELEGATION_EFFORT_COST;
    }

    // Hand an initiative to somebody too. Preferring whoever was not given a file keeps their
    // month undivided; a senior can take a second thing, at half speed on each, which is the
    // trade `DELEGATION_CAPACITY` exists to offer.
    if (useInitiatives && game.initiatives.length > 0 && budget >= DELEGATION_EFFORT_COST) {
      const spare = byOutput.filter((s) => !handed.has(s.id));
      const carrier = spare[0] ?? byOutput.find((s) => s.seniority === 'senior');
      const live = game.initiatives[0];
      if (carrier && live) {
        allocation.initiativeDelegations[live.templateId] = carrier.id;
        budget -= DELEGATION_EFFORT_COST;
      }
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

  // Build allies for the post you are actually aiming at — and at the top of the tree, where the
  // only thing left to climb is the Minister threshold.
  //
  // This has to match how the bot picks offers, or it does not work at all. Taking the *cheapest*
  // requirement across the fork looked reasonable and was a bug: from Head of Unit two of the four
  // onward posts want no political capital, so the minimum was zero, so the bot never networked,
  // so it never reached the line-track posts that want forty. Careers piled up at tier 3 with a
  // political capital of thirteen.
  const onward = postsFrom(registry, game.player.postId);
  const target =
    onward.length === 0
      ? undefined
      : onward.reduce((best, post) => (post.baseSalary > best.baseSalary ? post : best));
  const needsCapital = target
    ? (target.from.find((e) => e.from === game.player.postId)?.requires.minPoliticalCapital ?? 0)
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

  // Then what you chose to do, out of what the board did not need.
  //
  // The first version of this took a third of the month *before* the files, on the theory that
  // something funded out of leftovers never gets done. It is a good theory and it wrecked the
  // simulation: at tier one the board already wants more than the month holds, so pre-committing
  // a third meant missed deadlines, a collapsing performance score, and careers that ended at
  // year fourteen on tier two. The scheduling loop above already spreads each file over the
  // months it has, so what survives it is genuine slack — and slack is exactly what a real
  // official finds for the thing they actually care about.
  //
  // Half the slack rather than all of it: the points the board did not schedule still buy
  // quality on the files they land on, and a bot that stops spending them entirely trades six
  // years of career for the initiative. Half is the split that leaves both worth doing.
  if (useInitiatives && game.initiatives.length > 0) {
    // At least one point whenever there is any slack at all. `floor(budget / 2)` alone rounds a
    // one-point month down to nothing, and three of those in a row is a dead initiative — which
    // is how the first run managed to lapse two hundred and twenty-three of them and finish
    // eleven. Keeping it ticking over is most of what keeping a project alive actually is.
    let envelope = Math.min(budget, Math.max(1, Math.floor(budget / 2)));
    for (const live of game.initiatives) {
      if (envelope <= 0 || budget <= 0) break;
      const template = registry.initiatives.find((t) => t.id === live.templateId);
      if (!template) continue;

      const outstanding = Math.max(0, live.required - live.progress);
      const spend = Math.min(cycleCap(template), outstanding, envelope, budget);
      if (spend > 0) {
        allocation.initiativeEffort[live.templateId] = spend;
        envelope -= spend;
        budget -= spend;
      }
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

export function playCareer(options: CareerOptions): RunResult {
  const {
    seed,
    department,
    strategy = 'balanced',
    maxTurns = 200,
    stopAtLevel,
    preferredTrack,
    useInitiatives = true,
    useDirectives = true,
    usePerks = true,
    perkBranch,
    matchSpecialisms = true,
    useDeputy = true,
    useNegotiation = true,
  } = options;

  let game = createGame({ name: 'Bot', department, seed }, registry);

  // The bot picks its house rules on day one and never revisits them, which is roughly what
  // happens in life. It takes the pressure itself, because a bot that empties its own unit
  // measures attrition rather than anything else; it moves fast, because on a board oversubscribed
  // at 1.35 the extra point a documented file costs is not repaid; and it hires for experience,
  // because it never stays anywhere long enough for potential to arrive.
  //
  // These are one competent set of answers, not the best ones. That is the point of measuring
  // against them rather than against an optimiser.
  if (useDirectives) {
    game = {
      ...game,
      flags: {
        ...game.flags,
        [directiveFlag('hours')]: 1,
        [directiveFlag('rigour')]: 2,
        [directiveFlag('hiring')]: 2,
      },
    };
  }
  // A second stream so the bot's decisions do not consume the game's randomness.
  let botState = seedToState(seed ^ 0x5f3759df);

  let promotions = 0;
  let tasksCompleted = 0;
  let tasksFailed = 0;
  let initiativesStarted = 0;
  let perksTaken = 0;
  let moraleSum = 0;
  let moraleMonths = 0;
  let peakStaffLevel = 1;
  let monthsWithDeputy = 0;
  let negotiations = 0;
  let specialistMatches = 0;
  let delegationsMade = 0;
  let initiativesCompleted = 0;
  let initiativesLapsed = 0;
  let guard = 0;

  while (!game.ending && guard < maxTurns * 12) {
    guard += 1;

    switch (game.phase) {
      case 'allocation': {
        // Take a post when one is offered: the bot is ambitious. With a graph there can be
        // several live at once, so it picks — by track if one was asked for, otherwise by money.
        // Only one offer is created per cycle, so preferring a track among simultaneous offers
        // does nothing — the bot has to actually turn down the ones it does not want. Without a
        // preference it climbs by money, which is what an ambitious player does.
        //
        // The tree forks at tier 3, so the expert and political branches cannot be joined from
        // Alderford at all. A bot that refuses everything off its track therefore has to be
        // willing to travel: when nothing on the preferred track is reachable from here, it takes
        // the best offer going, which is also what a real player has to do.
        const reachableOnTrack =
          preferredTrack !== undefined &&
          postsFrom(registry, game.player.postId).some((p) => p.track === preferredTrack);

        const offers =
          preferredTrack && reachableOnTrack
            ? game.offers.filter((o) => getPost(registry, o.toPost).track === preferredTrack)
            : [...game.offers];

        if (offers.length > 0) {
          const chosen = offers.reduce((best, o) => (o.salary > best.salary ? o : best));
          game = acceptOffer(game, registry, chosen.id);
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
        // Start something when the desk is under control — no missed deadlines last cycle, and
        // stress in hand. An official who is drowning does not take on a five-year project, and a
        // bot that does produces a corpus of careers that all end in dismissal rather than a
        // measurement of what initiatives are worth.
        // And only once there is a way to *feed* it. Below tier three you have ten points and a
        // board that wants thirteen, so an initiative started there starves — the bot burns its
        // one attempt and learns nothing. A unit to delegate to, or the expert track's much
        // larger personal budget, is what actually makes an undertaking affordable.
        const canAfford = game.staff.length > 0 || game.player.track === 'expert';
        const coping =
          canAfford &&
          (game.lastReport?.failed.length ?? 0) === 0 &&
          game.stats.stress < REST_THRESHOLD;
        if (useInitiatives && coping) {
          // Never pick up something already dropped. The engine allows a second attempt — that is
          // a real player's prerogative — but a bot that takes it restarts the same undertaking
          // sixteen times a career and measures churn instead of commitment.
          const open = startableInitiatives(game, registry).filter(
            (t) => !game.flags[lapsedFlag(t.id)],
          );
          if (open.length > 0) {
            const before = game.initiatives.length;
            game = startInitiative(game, registry, open[0]!.id);
            if (game.initiatives.length > before) initiativesStarted += 1;
          }
        }

        // Spent before the month resolves, so a perk taken this cycle is felt in this cycle —
        // which is what a player clicking the button would see, and therefore what the A/B has
        // to measure.
        /*
         * Name a second once there are enough people to be worth it.
         *
         * Below four the arithmetic is against you: you lose that person's own output to save a
         * handover or two, and a small unit needs the output more than it needs the structure.
         * That threshold is the whole decision the feature offers, so the bot has to make it the
         * way a player would rather than appointing somebody the moment it can.
         */
        /*
         * Argue about what is about to be missed.
         *
         * Only for files that genuinely cannot be finished — a bot that scopes everything is
         * measuring nothing but the cost of the verb — and only while there are favours to spare,
         * because political capital is also what promotions are keyed off. Cutting a file back is
         * tried before moving its date: it is cheaper, and the ceiling it costs is only worth
         * anything on a file that was going to be finished well, which this one was not.
         */
        if (useNegotiation && game.stats.politicalCapital > NEGOTIATION_RESERVE) {
          const doomed = game.tasks.filter(
            (task) =>
              task.deadlineTurn - game.turn <= 1 &&
              task.required - task.progress > effortAvailable(game, registry, false) / 2,
          );
          for (const task of doomed) {
            if (game.stats.politicalCapital <= NEGOTIATION_RESERVE) break;
            const before = game;
            game = scopeDown(game, task.uid);
            if (game === before) game = extendDeadline(game, task.uid);
            if (game !== before) negotiations += 1;
          }
        }

        if (useDeputy && !deputyOf(game) && game.staff.length >= 4) {
          const best = [...game.staff]
            .filter(canBeDeputy)
            .sort((a, b) => b.skill - a.skill)[0];
          if (best) game = appointDeputy(game, best.id);
        }

        if (usePerks) {
          game = spendPerkPoints(game, perkBranch);
          perksTaken = takenPerks(game, registry).length;
        }

        const plan = planAllocation(game, strategy, useInitiatives, matchSpecialisms);
        for (const [taskUid, staffId] of Object.entries(plan.delegations)) {
          const member = game.staff.find((s) => s.id === staffId);
          const task = game.tasks.find((t) => t.uid === taskUid);
          const template = task ? registry.tasks[task.templateId] : undefined;
          if (!member || !template) continue;
          delegationsMade += 1;
          if (specialismFactor(member, template) > 1) specialistMatches += 1;
        }

        game = resolveTurn(game, registry, plan);
        if (deputyOf(game)) monthsWithDeputy += 1;
        for (const member of game.staff) {
          peakStaffLevel = Math.max(peakStaffLevel, staffLevel(member));
        }
        if (game.staff.length > 0) {
          moraleSum += averageMorale(game);
          moraleMonths += 1;
        }
        tasksCompleted += game.lastReport?.completed.length ?? 0;
        tasksFailed += game.lastReport?.failed.length ?? 0;
        initiativesCompleted += game.lastReport?.initiativesCompleted?.length ?? 0;
        initiativesLapsed += game.lastReport?.initiativesLapsed?.length ?? 0;
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
    if (stopAtLevel !== undefined && game.player.level >= stopAtLevel && game.phase === 'allocation') {
      break;
    }
  }

  return {
    finalState: game,
    seed,
    department,
    track: game.player.track,
    postId: game.player.postId,
    turns: game.turn,
    months: game.calendarMonth,
    level: game.player.level,
    ending: game.ending,
    stats: game.stats,
    salary: game.player.salary,
    promotions,
    tasksCompleted,
    tasksFailed,
    initiativesStarted,
    perksTaken,
    meanUnitMorale: moraleMonths > 0 ? moraleSum / moraleMonths : 0,
    peakStaffLevel,
    monthsWithDeputy,
    negotiations,
    specialistMatches,
    delegationsMade,
    initiativesCompleted,
    initiativesLapsed,
  };
}

export function playMany(
  seeds: number[],
  departments: readonly DepartmentId[],
  options: Omit<CareerOptions, 'seed' | 'department'> = {},
): RunResult[] {
  const results: RunResult[] = [];
  for (const department of departments) {
    for (const seed of seeds) {
      results.push(playCareer({ ...options, seed, department }));
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
    meanYears: mean((r) => r.months) / 12,
    meanLevel: mean((r) => r.level),
    meanReputation: mean((r) => r.stats.reputation),
    meanStress: mean((r) => r.stats.stress),
    meanIntegrity: mean((r) => r.stats.integrity),
    meanPoliticalCapital: mean((r) => r.stats.politicalCapital),
    meanSalary: mean((r) => r.salary),
    meanInitiativesStarted: mean((r) => r.initiativesStarted),
    meanPerksTaken: mean((r) => r.perksTaken),
    meanUnitMorale: mean((r) => r.meanUnitMorale),
    meanPeakStaffLevel: mean((r) => r.peakStaffLevel),
    meanMonthsWithDeputy: mean((r) => r.monthsWithDeputy),
    meanNegotiations: mean((r) => r.negotiations),
    totalSpecialistMatches: results.reduce((n, r) => n + r.specialistMatches, 0),
    totalDelegations: results.reduce((n, r) => n + r.delegationsMade, 0),
    meanInitiativesCompleted: mean((r) => r.initiativesCompleted),
    totalInitiativesLapsed: results.reduce((n, r) => n + r.initiativesLapsed, 0),
    completionRate: mean((r) =>
      r.tasksCompleted + r.tasksFailed === 0
        ? 1
        : r.tasksCompleted / (r.tasksCompleted + r.tasksFailed),
    ),
  };
}

export function getPostTitle(postId: string): string {
  return getPost(registry, postId).titleKey;
}
