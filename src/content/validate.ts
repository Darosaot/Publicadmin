/**
 * Structural checks over the whole content corpus.
 *
 * Run from `tests/engine/content.test.ts`, so a dangling event id or a missing string fails the
 * build rather than crashing a player's third year in office.
 */

import { ENDING_IDS, TRACK_IDS, type DepartmentId, type Effect } from '../engine/types';
import { DEPARTMENT_IDS } from '../engine/types';
import { EN_STRINGS } from './authoring';
import { bodies } from './bodies';
import { posts } from './careers';
import { departments } from './departments';
import { endingCopy } from './endings';
import { allEvents, eventRegistry } from './events';
import { initiatives } from './initiatives';
import { allTasks, taskRegistry } from './tasks';

export function validateContent(): string[] {
  const problems: string[] = [];
  const tiers = [...new Set(posts.map((p) => p.tier))].sort((a, b) => a - b);
  const has = (key: string) => EN_STRINGS[key] !== undefined;

  const requireString = (key: string, where: string) => {
    if (!has(key)) problems.push(`${where}: missing English string for "${key}"`);
  };

  /* ---------------------------------------------------------------- ids */

  const seenEventIds = new Set<string>();
  for (const event of allEvents) {
    if (seenEventIds.has(event.id)) problems.push(`duplicate event id: ${event.id}`);
    seenEventIds.add(event.id);
  }

  const seenTaskIds = new Set<string>();
  for (const task of allTasks) {
    if (seenTaskIds.has(task.id)) problems.push(`duplicate task id: ${task.id}`);
    seenTaskIds.add(task.id);
  }

  /* -------------------------------------------------------------- events */

  for (const event of allEvents) {
    requireString(event.titleKey, `event ${event.id}`);
    requireString(event.bodyKey, `event ${event.id}`);

    if (event.choices.length < 2 && event.choices.length !== 1) {
      problems.push(`event ${event.id}: has no choices`);
    }
    if (event.choices.length > 4) {
      problems.push(`event ${event.id}: ${event.choices.length} choices (maximum is 4)`);
    }
    if (event.weight <= 0 && event.kind === 'random') {
      problems.push(`event ${event.id}: random events need a positive weight`);
    }

    const seenChoiceIds = new Set<string>();
    for (const choice of event.choices) {
      if (seenChoiceIds.has(choice.id)) {
        problems.push(`event ${event.id}: duplicate choice id "${choice.id}"`);
      }
      seenChoiceIds.add(choice.id);
      requireString(choice.labelKey, `event ${event.id} choice ${choice.id}`);

      if (choice.outcomes.length === 0) {
        problems.push(`event ${event.id} choice ${choice.id}: no outcomes`);
      } else if (choice.outcomes.every((outcome) => outcome.conditions)) {
        // Otherwise a state that satisfies none of them would leave the choice with no result.
        problems.push(
          `event ${event.id} choice ${choice.id}: every outcome is conditional, so there is no fallback`,
        );
      }
      for (const outcome of choice.outcomes) {
        requireString(outcome.textKey, `event ${event.id} choice ${choice.id}`);
        if (outcome.weight <= 0) {
          problems.push(`event ${event.id} choice ${choice.id}: outcome weight must be positive`);
        }
        problems.push(...validateEffects(outcome.effects, `event ${event.id}/${choice.id}`));
      }
    }
  }

  /* --------------------------------------------------------------- tasks */

  for (const task of allTasks) {
    requireString(task.titleKey, `task ${task.id}`);
    requireString(task.descKey, `task ${task.id}`);

    if (task.baseEffort <= 0) problems.push(`task ${task.id}: baseEffort must be positive`);
    /*
     * Crises invert the weight rule rather than being exempted from it.
     *
     * `refillBoard` filters them out, so a weight would never be read — but a template carrying
     * one is a template somebody might later assume can be drawn, and a crisis leaking into the
     * random pool would put a twenty-six-point file on an unsuspecting desk. Requiring zero makes
     * "this never arrives by chance" a thing the build checks rather than a thing the comment
     * claims.
     */
    if (task.crisis) {
      if (task.weight !== 0) {
        problems.push(`task ${task.id}: a crisis must have weight 0 — it is never drawn`);
      }
    } else if (task.weight <= 0) {
      problems.push(`task ${task.id}: weight must be positive`);
    }

    const [min, max] = task.deadlineRange;
    if (min < 1 || max < min) {
      problems.push(`task ${task.id}: deadlineRange [${min}, ${max}] is not usable`);
    }

    for (const [tier, effects] of Object.entries(task.onComplete ?? {})) {
      problems.push(...validateEffects(effects, `task ${task.id} onComplete.${tier}`));
    }
    problems.push(...validateEffects(task.onFail ?? [], `task ${task.id} onFail`));
  }

  /* --------------------------------------------------------------- flags */

  /**
   * A flag nothing reads is a dropped thread.
   *
   * Flags are the game's memory, and writing one is a promise that the decision will matter
   * later. It is very easy to make that promise while authoring a scene and never keep it — at
   * one point twenty-five of the twenty-seven flags in the corpus were write-only, which is a
   * great deal of authored consequence that no player could ever encounter.
   */
  const written = new Set<string>();
  const read = new Set<string>();

  const noteEffects = (effects: readonly { kind: string; flag?: string }[]) => {
    for (const effect of effects) {
      if ((effect.kind === 'flag' || effect.kind === 'flagDelta') && effect.flag) {
        written.add(effect.flag);
      }
    }
  };
  const noteCondition = (condition: { requiredFlags?: string[]; forbiddenFlags?: string[]; minFlag?: Record<string, number>; maxFlag?: Record<string, number> } | undefined) => {
    if (!condition) return;
    for (const flag of condition.requiredFlags ?? []) read.add(flag);
    for (const flag of condition.forbiddenFlags ?? []) read.add(flag);
    for (const flag of Object.keys(condition.minFlag ?? {})) read.add(flag);
    for (const flag of Object.keys(condition.maxFlag ?? {})) read.add(flag);
  };

  for (const event of allEvents) {
    noteCondition(event.conditions);
    for (const choice of event.choices) {
      noteCondition(choice.conditions);
      for (const outcome of choice.outcomes) {
        noteCondition(outcome.conditions);
        noteEffects(outcome.effects);
      }
    }
  }
  for (const task of allTasks) {
    for (const effects of Object.values(task.onComplete ?? {})) noteEffects(effects);
    noteEffects(task.onFail ?? []);
  }
  // Initiatives count on both sides. Missing them here would report a flag an event sets and only
  // an initiative gates on as write-only — a false positive — and would let an initiative write a
  // flag nothing reads, which is the real thing this census exists to catch.
  for (const initiative of initiatives) {
    noteCondition(initiative.available);
    noteEffects(initiative.onComplete);
    noteEffects(initiative.onLapse);
  }

  // The engine itself sets and reads this one, so the corpus never will.
  read.add('minister_track');

  for (const flag of [...written].sort()) {
    if (!read.has(flag)) {
      problems.push(
        `flag "${flag}" is set but nothing ever reads it — either gate something on it or drop it`,
      );
    }
  }

  /* --------------------------------------------------------- departments */

  for (const id of DEPARTMENT_IDS) {
    const department = departments[id];
    if (!department) {
      problems.push(`no department defined for "${id}"`);
      continue;
    }
    requireString(department.nameKey, `department ${id}`);
    requireString(department.blurbKey, `department ${id}`);
    requireString(department.flavourKey, `department ${id}`);

    if (!allTasks.some((t) => t.departments === 'any' || t.departments.includes(id))) {
      problems.push(`department ${id}: no task template can ever land on this desk`);
    }
    if (!hasDepartmentEvent(id)) {
      problems.push(`department ${id}: no random event targets this department`);
    }

    // Tasks are tier-banded so the desk changes as you climb. The risk that introduces is
    // starving a tier: capping the clerical work without writing enough senior work to replace it
    // leaves a Director-General with three templates on repeat.
    //
    // Checked per tier rather than per post — several posts share a tier, and the hungriest of
    // them sets the bar.
    for (const tier of tiers) {
      const slots = Math.max(...posts.filter((p) => p.tier === tier).map((p) => p.taskSlots));
      const eligible = allTasks.filter(
        (task) =>
          (task.departments === 'any' || task.departments.includes(id)) &&
          (task.minLevel ?? 1) <= tier &&
          (task.maxLevel ?? Infinity) >= tier,
      );
      const needed = slots + 2;
      if (eligible.length < needed) {
        problems.push(
          `department ${id} at tier ${tier}: only ${eligible.length} eligible task ` +
            `templates for ${slots} slots (want at least ${needed} for variety)`,
        );
      }
      // And the band should actually differ, or the levelling is cosmetic.
      const departmentSpecific = eligible.filter((t) => t.departments !== 'any');
      if (departmentSpecific.length === 0) {
        problems.push(`department ${id} at tier ${tier}: no department-specific work`);
      }
    }
  }

  /* -------------------------------------------------------------- career */

  const byId = new Map(posts.map((p) => [p.id, p]));

  const seenPostIds = new Set<string>();
  for (const post of posts) {
    if (seenPostIds.has(post.id)) problems.push(`duplicate post id: ${post.id}`);
    seenPostIds.add(post.id);

    requireString(post.titleKey, `post ${post.id}`);
    requireString(post.orgKey, `post ${post.id}`);
    requireString(post.orgShortKey, `post ${post.id}`);

    if (post.effortPoints <= 0 || post.taskSlots <= 0) {
      problems.push(`post ${post.id}: effort points and slots must be positive`);
    }
    if (post.monthsPerTurn <= 0) {
      problems.push(`post ${post.id}: a cycle has to cover at least one month`);
    }
    if (post.tier < 1) problems.push(`post ${post.id}: tier must be 1 or more`);

    for (const edge of post.from) {
      const source = byId.get(edge.from);
      if (!source) {
        problems.push(`post ${post.id}: reachable from "${edge.from}", which does not exist`);
        continue;
      }
      if (source.tier > post.tier) {
        problems.push(`post ${post.id}: cannot be entered from the more senior ${edge.from}`);
      }
      // A move that is not marked sideways is a promotion, and a promotion pays more. Sideways
      // moves are exempt: stepping off the line track onto the expert one is meant to cost money.
      if (!edge.sideways && post.baseSalary <= source.baseSalary) {
        problems.push(
          `post ${post.id}: promotion from ${edge.from} does not pay more — mark it sideways if that is deliberate`,
        );
      }
    }
  }

  // Exactly one starting post, and every other post reachable from it. This replaces the old
  // "levels must be contiguous from 1" rule, which a graph cannot satisfy.
  const roots = posts.filter((p) => p.from.length === 0);
  if (roots.length !== 1) {
    problems.push(`there must be exactly one starting post; found ${roots.length}`);
  }

  const root = roots[0];
  if (root) {
    const reached = new Set([root.id]);
    let growing = true;
    while (growing) {
      growing = false;
      for (const post of posts) {
        if (reached.has(post.id)) continue;
        if (post.from.some((edge) => reached.has(edge.from))) {
          reached.add(post.id);
          growing = true;
        }
      }
    }
    for (const post of posts) {
      if (!reached.has(post.id)) {
        problems.push(`post ${post.id}: no career can ever reach it`);
      }
    }
  }

  // Every track needs somewhere to end up, or it is a branch that quietly rejoins the trunk.
  for (const track of TRACK_IDS) {
    if (!posts.some((p) => p.track === track && p.tier === Math.max(...tiers))) {
      problems.push(`track "${track}" has no post at the top tier`);
    }
  }

  /* -------------------------------------------------------------- bodies */

  const seenBodyIds = new Set<string>();
  for (const body of bodies) {
    if (seenBodyIds.has(body.id)) problems.push(`duplicate body id: ${body.id}`);
    seenBodyIds.add(body.id);

    requireString(body.kindKey, `body ${body.id}`);
    requireString(body.blurbKey, `body ${body.id}`);

    if (body.baselineCondition < 1 || body.baselineCondition > 99) {
      problems.push(
        `body ${body.id}: a founding condition of ${body.baselineCondition} leaves nowhere to move`,
      );
    }
    if (!DEPARTMENT_IDS.includes(body.beat as DepartmentId)) {
      problems.push(`body ${body.id}: "${body.beat}" is not a department`);
    }
    if (Math.abs(body.drift) > 0.5) {
      // A whole point a month is six a year and a hundred and eighty over a career: a place that
      // moves that fast is not drifting, it is collapsing, and should be an event.
      problems.push(`body ${body.id}: drift of ${body.drift} a month is too fast to be drift`);
    }
  }

  // Every department should have somewhere in the country that is its problem, or its events have
  // nothing to point at.
  for (const id of DEPARTMENT_IDS) {
    if (!bodies.some((body) => body.beat === id)) {
      problems.push(`department ${id}: no body in the country is on its beat`);
    }
  }

  /* ------------------------------------------------------- naming a person */

  /**
   * The interpolation channel, checked in both directions.
   *
   * `{alum}` is filled at render time from the alumni roster, and `namesAlumnus` is what makes the
   * event wait until there is somebody to name and tells the engine which end of the roster to
   * point at. Prose without the declaration would render a sentence with a hole in it.
   *
   * The second direction is the one that earns its place. The whole channel — the spotlight, the
   * param, the helpers — was once built, documented, unit-tested and then used by no content at
   * all, and nothing in the build had anything to say about it. A declaration on prose that never
   * interpolates is the smallest visible symptom of that mistake, so it is now an error.
   */
  for (const event of allEvents) {
    const prose = [EN_STRINGS[event.titleKey], EN_STRINGS[event.bodyKey]]
      .concat(
        event.choices.flatMap((choice) => [
          EN_STRINGS[choice.labelKey],
          ...choice.outcomes.map((outcome) => EN_STRINGS[outcome.textKey]),
        ]),
      )
      .join(' ');

    const interpolates = prose.includes('{alum}');

    if (interpolates && event.namesAlumnus === undefined) {
      problems.push(
        `event ${event.id}: prose uses {alum} but the event does not declare namesAlumnus, so it ` +
          `can fire with nobody to name`,
      );
    }
    if (!interpolates && event.namesAlumnus !== undefined) {
      problems.push(
        `event ${event.id}: declares namesAlumnus but never uses {alum} — the declaration costs ` +
          `the event its eligibility for nothing`,
      );
    }
  }

  if (!allEvents.some((event) => event.namesAlumnus !== undefined)) {
    // The census above cannot fire if nothing ever opts in. This is the backstop that would have
    // caught the original gap, where the machinery shipped and the corpus never used it.
    problems.push('no event ever names a former colleague, so the alumni roster is write-only');
  }

  /* --------------------------------------------------------- initiatives */

  const seenInitiativeIds = new Set<string>();
  for (const initiative of initiatives) {
    if (seenInitiativeIds.has(initiative.id)) {
      problems.push(`duplicate initiative id: ${initiative.id}`);
    }
    seenInitiativeIds.add(initiative.id);

    requireString(initiative.titleKey, `initiative ${initiative.id}`);
    requireString(initiative.descKey, `initiative ${initiative.id}`);
    requireString(initiative.completeKey, `initiative ${initiative.id}`);
    requireString(initiative.lapseKey, `initiative ${initiative.id}`);

    problems.push(
      ...validateEffects(initiative.onComplete, `initiative ${initiative.id} onComplete`),
    );
    problems.push(...validateEffects(initiative.onLapse, `initiative ${initiative.id} onLapse`));

    if (initiative.onComplete.length === 0) {
      problems.push(`initiative ${initiative.id}: finishing it changes nothing`);
    }
    if (initiative.minCycles < 1) {
      problems.push(`initiative ${initiative.id}: minCycles must be at least 1`);
    }
    // A junior has ten points a cycle and a board that already wants more than that. Anything
    // needing more than a full cycle's undivided attention is not a commitment, it is a wall.
    const perCycle = Math.ceil(initiative.required / Math.max(1, initiative.minCycles));
    if (perCycle > 8) {
      problems.push(
        `initiative ${initiative.id}: needs ${perCycle} points a cycle, which is most of a month`,
      );
    }
    // The payoff rule from the balance work: offers key off reputation and reputation decays, so
    // an initiative paying a lump of it converts hoarded effort straight into promotion velocity.
    // Pay in the world instead — condition, standing, flags, tasks, budget.
    const reputation = initiative.onComplete.find(
      (effect) => effect.kind === 'stat' && effect.stat === 'reputation',
    );
    if (reputation && reputation.kind === 'stat' && reputation.delta > 4) {
      problems.push(
        `initiative ${initiative.id}: pays ${reputation.delta} reputation — pay in kind instead`,
      );
    }
  }

  // An initiative nobody can ever start is authored consequence no player will meet, which is the
  // same failure the write-only flag census exists to catch.
  for (const initiative of initiatives) {
    const gate = initiative.available;
    if (gate.minLevel !== undefined && gate.minLevel > tiers[tiers.length - 1]!) {
      problems.push(
        `initiative ${initiative.id}: requires tier ${gate.minLevel}, above the top of the tree`,
      );
    }
    if (
      gate.minLevel !== undefined &&
      gate.maxLevel !== undefined &&
      gate.minLevel > gate.maxLevel
    ) {
      problems.push(`initiative ${initiative.id}: its level range is empty`);
    }
  }

  /* ------------------------------------------------------------- endings */

  for (const ending of ENDING_IDS) {
    const copy = endingCopy[ending];
    if (!copy) {
      problems.push(`no closing text for ending "${ending}"`);
      continue;
    }
    requireString(copy.titleKey, `ending ${ending}`);
    requireString(copy.bodyKey, `ending ${ending}`);
    requireString(copy.epitaphKey, `ending ${ending}`);
  }

  // Every ending except the scripted one must be reachable from the engine's own checks; the
  // Minister ending has to be reachable from content, so verify something actually grants it.
  const grantsMinister = allEvents.some((event) =>
    event.choices.some((choice) =>
      choice.outcomes.some((outcome) =>
        outcome.effects.some((e) => e.kind === 'endGame' && e.ending === 'minister'),
      ),
    ),
  );
  if (!grantsMinister) problems.push('no event can award the Minister ending');

  return problems;
}

function hasDepartmentEvent(id: DepartmentId): boolean {
  return allEvents.some(
    (event) => event.kind === 'random' && event.conditions?.departments?.includes(id),
  );
}

/**
 * Reference-checks a list of effects.
 *
 * Typed against the `Effect` union rather than `unknown[]` so the switch below can be exhaustive:
 * an effect kind that carries a content id and is not checked here would let a typo ship, and the
 * player would meet it years into a career. Adding a kind to the union now forces a decision.
 */
function validateEffects(effects: readonly Effect[], where: string): string[] {
  const problems: string[] = [];

  for (const effect of effects) {
    switch (effect.kind) {
      case 'spawnTask':
        if (!taskRegistry[effect.templateId]) {
          problems.push(`${where}: spawnTask references unknown template "${effect.templateId}"`);
        }
        break;
      case 'queueEvent':
        if (!eventRegistry[effect.eventId]) {
          problems.push(`${where}: queueEvent references unknown event "${effect.eventId}"`);
        }
        break;
      case 'endGame':
        if (!ENDING_IDS.includes(effect.ending)) {
          problems.push(`${where}: endGame references unknown ending "${effect.ending}"`);
        }
        break;
      case 'stat':
      case 'salary':
      case 'flagDelta':
        if (effect.delta === 0) problems.push(`${where}: effect with a delta of zero does nothing`);
        break;

      // These carry no content id and nothing to cross-check. Listed rather than defaulted so
      // that a new kind cannot join them by accident.
      case 'flag':
      case 'teamMorale':
      case 'teamSkill':
      case 'budget':
      case 'budgetMonthly':
      case 'loseStaff':
      case 'gainStaff':
        break;

      default: {
        const unhandled: never = effect;
        throw new Error(`validateEffects: unhandled effect ${JSON.stringify(unhandled)}`);
      }
    }
  }

  return problems;
}
