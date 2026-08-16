/**
 * A small hand-built registry for engine tests.
 *
 * Testing against fixtures rather than the shipped content means a balance tweak or a new event
 * can't turn an engine test red for reasons that have nothing to do with the engine.
 */

import type { ContentRegistry } from '../../src/engine/registry';
import type {
  Post,
  Department,
  DepartmentId,
  GameEvent,
  InitiativeTemplate,
  TaskTemplate,
  WorldBody,
} from '../../src/engine/types';
import { DEPARTMENT_IDS } from '../../src/engine/types';

function department(id: DepartmentId): Department {
  return {
    id,
    nameKey: `dept.${id}.name`,
    blurbKey: `dept.${id}.blurb`,
    flavourKey: `dept.${id}.flavour`,
    startingAdjustments: id === 'legal' ? { integrity: 6, politicalCapital: -3 } : {},
  };
}

/**
 * A three-tier career with one fork, so tests can exercise the graph without depending on the
 * shipped fifteen-post tree. Tier 3 offers a choice: a unit to run, or a specialist post with
 * none — which is exactly the shape the engine has to handle.
 */
export const testPosts: Post[] = [
  {
    id: 'post.test.junior',
    tier: 1,
    track: 'line',
    titleKey: 'career.1.title',
    orgKey: 'career.1.org',
    orgShortKey: 'career.1.org_short',
    baseSalary: 2100,
    effortPoints: 10,
    taskSlots: 3,
    monthsPerTurn: 1,
    from: [],
  },
  {
    id: 'post.test.senior',
    tier: 2,
    track: 'line',
    titleKey: 'career.2.title',
    orgKey: 'career.2.org',
    orgShortKey: 'career.2.org_short',
    baseSalary: 2900,
    effortPoints: 11,
    taskSlots: 4,
    monthsPerTurn: 1,
    from: [
      {
        from: 'post.test.junior',
        requires: { minReputation: 35, minPerformance: 50, minTurnsAtLevel: 8 },
      },
    ],
  },
  {
    id: 'post.test.head',
    tier: 3,
    track: 'line',
    titleKey: 'career.3.title',
    orgKey: 'career.3.org',
    orgShortKey: 'career.3.org_short',
    baseSalary: 3900,
    effortPoints: 12,
    taskSlots: 4,
    monthsPerTurn: 2,
    headcount: 3,
    monthlyBudget: 9000,
    from: [
      {
        from: 'post.test.senior',
        requires: {
          minReputation: 50,
          minPerformance: 55,
          minPoliticalCapital: 25,
          minTurnsAtLevel: 10,
        },
      },
    ],
  },
  {
    id: 'post.test.specialist',
    tier: 3,
    track: 'expert',
    titleKey: 'career.3.title',
    orgKey: 'career.3.org',
    orgShortKey: 'career.3.org_short',
    baseSalary: 3800,
    effortPoints: 15,
    taskSlots: 3,
    monthsPerTurn: 2,
    from: [
      {
        from: 'post.test.senior',
        requires: { minReputation: 48, minPerformance: 62, minTurnsAtLevel: 10 },
      },
    ],
  },
];

export const testTasks: TaskTemplate[] = [
  {
    id: 'task.test.easy',
    titleKey: 'task.test.easy.title',
    descKey: 'task.test.easy.desc',
    departments: 'any',
    baseEffort: 4,
    deadlineRange: [3, 3],
    difficulty: 1,
    weight: 10,
  },
  {
    id: 'task.test.hard',
    titleKey: 'task.test.hard.title',
    descKey: 'task.test.hard.desc',
    departments: 'any',
    baseEffort: 9,
    deadlineRange: [2, 2],
    difficulty: 3,
    weight: 10,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'politicalCapital', delta: 3 }],
    },
    onFail: [{ kind: 'queueEvent', eventId: 'evt.test.followup', delayTurns: 1 }],
  },
  {
    id: 'task.test.legal_only',
    titleKey: 'task.test.legal_only.title',
    descKey: 'task.test.legal_only.desc',
    departments: ['legal'],
    baseEffort: 5,
    deadlineRange: [4, 4],
    difficulty: 2,
    weight: 10,
  },
];

export const testEvents: GameEvent[] = [
  {
    id: 'evt.test.common',
    kind: 'random',
    titleKey: 'evt.test.common.title',
    bodyKey: 'evt.test.common.body',
    weight: 10,
    choices: [
      {
        id: 'safe',
        labelKey: 'evt.test.common.choice.safe',
        outcomes: [
          {
            weight: 1,
            textKey: 'evt.test.common.choice.safe.out.0',
            effects: [{ kind: 'stat', stat: 'reputation', delta: 2 }],
          },
        ],
      },
      {
        id: 'risky',
        labelKey: 'evt.test.common.choice.risky',
        outcomes: [
          {
            weight: 1,
            textKey: 'evt.test.common.choice.risky.out.0',
            effects: [{ kind: 'stat', stat: 'reputation', delta: 10 }],
          },
          {
            weight: 1,
            textKey: 'evt.test.common.choice.risky.out.1',
            effects: [{ kind: 'stat', stat: 'integrity', delta: -10 }],
          },
        ],
      },
    ],
  },
  {
    id: 'evt.test.gated',
    kind: 'random',
    titleKey: 'evt.test.gated.title',
    bodyKey: 'evt.test.gated.body',
    weight: 10,
    conditions: { minLevel: 3, minStat: { politicalCapital: 40 } },
    choices: [
      {
        id: 'only',
        labelKey: 'evt.test.gated.choice.only',
        outcomes: [
          { weight: 1, textKey: 'evt.test.gated.choice.only.out.0', effects: [] },
        ],
      },
      {
        id: 'expensive',
        labelKey: 'evt.test.gated.choice.expensive',
        conditions: { minStat: { politicalCapital: 90 } },
        outcomes: [
          { weight: 1, textKey: 'evt.test.gated.choice.expensive.out.0', effects: [] },
        ],
      },
    ],
  },
  {
    id: 'evt.test.milestone',
    kind: 'milestone',
    titleKey: 'evt.test.milestone.title',
    bodyKey: 'evt.test.milestone.body',
    weight: 1,
    conditions: { minTurn: 2 },
    choices: [
      {
        id: 'ok',
        labelKey: 'evt.test.milestone.choice.ok',
        outcomes: [
          {
            weight: 1,
            textKey: 'evt.test.milestone.choice.ok.out.0',
            effects: [{ kind: 'flag', flag: 'saw_milestone' }],
          },
        ],
      },
      {
        id: 'no',
        labelKey: 'evt.test.milestone.choice.no',
        outcomes: [{ weight: 1, textKey: 'evt.test.milestone.choice.no.out.0', effects: [] }],
      },
    ],
  },
  {
    id: 'evt.test.followup',
    kind: 'followup',
    titleKey: 'evt.test.followup.title',
    bodyKey: 'evt.test.followup.body',
    weight: 1,
    choices: [
      {
        id: 'accept',
        labelKey: 'evt.test.followup.choice.accept',
        outcomes: [
          {
            weight: 1,
            textKey: 'evt.test.followup.choice.accept.out.0',
            effects: [{ kind: 'stat', stat: 'reputation', delta: -4 }],
          },
        ],
      },
      {
        id: 'fight',
        labelKey: 'evt.test.followup.choice.fight',
        outcomes: [
          { weight: 1, textKey: 'evt.test.followup.choice.fight.out.0', effects: [] },
        ],
      },
    ],
  },
  {
    id: 'evt.test.conditional',
    kind: 'followup',
    titleKey: 'evt.test.conditional.title',
    bodyKey: 'evt.test.conditional.body',
    weight: 1,
    choices: [
      {
        id: 'explain',
        labelKey: 'evt.test.conditional.choice.explain',
        outcomes: [
          {
            weight: 1,
            textKey: 'evt.test.conditional.choice.explain.out.0',
            conditions: { requiredFlags: ['left_a_note'] },
            effects: [{ kind: 'stat', stat: 'reputation', delta: 5 }],
          },
          {
            weight: 1,
            textKey: 'evt.test.conditional.choice.explain.out.1',
            effects: [{ kind: 'stat', stat: 'reputation', delta: -5 }],
          },
        ],
      },
      {
        id: 'silent',
        labelKey: 'evt.test.conditional.choice.silent',
        outcomes: [
          { weight: 1, textKey: 'evt.test.conditional.choice.silent.out.0', effects: [] },
        ],
      },
    ],
  },
  {
    id: 'evt.test.fatal',
    kind: 'followup',
    titleKey: 'evt.test.fatal.title',
    bodyKey: 'evt.test.fatal.body',
    weight: 1,
    choices: [
      {
        id: 'end',
        labelKey: 'evt.test.fatal.choice.end',
        outcomes: [
          {
            weight: 1,
            textKey: 'evt.test.fatal.choice.end.out.0',
            effects: [
              { kind: 'endGame', ending: 'minister' },
              { kind: 'stat', stat: 'reputation', delta: -100 },
            ],
          },
        ],
      },
      {
        id: 'stay',
        labelKey: 'evt.test.fatal.choice.stay',
        outcomes: [{ weight: 1, textKey: 'evt.test.fatal.choice.stay.out.0', effects: [] }],
      },
    ],
  },
];

/**
 * Three places: one rotting, one improving, one still. Enough to test drift in both directions
 * and to prove a body with `drift: 0` is left completely alone.
 */
const testBodies: WorldBody[] = [
  { id: 'sinking', baselineCondition: 40, drift: -0.5, beat: 'legal' },
  { id: 'rising', baselineCondition: 50, drift: 0.25, beat: 'finance' },
  { id: 'steady', baselineCondition: 60, drift: 0, beat: 'legal' },
];

/**
 * Three undertakings: a cheap one anyone can start, a gated one, and one whose cap bites.
 *
 * `capped` has `required` 12 over 6 cycles, so no single cycle may put in more than 2 however
 * much effort is thrown at it — which is the rule most easily broken by accident.
 */
const testInitiatives: InitiativeTemplate[] = [
  {
    id: 'init.cheap',
    titleKey: 'init.cheap.title',
    descKey: 'init.cheap.desc',
    completeKey: 'init.cheap.complete',
    lapseKey: 'init.cheap.lapse',
    required: 10,
    minCycles: 1,
    available: {},
    // Pays into the country as well as into a flag, because that is what an initiative is for and
    // because attribution has to have something to attribute.
    onComplete: [
      { kind: 'flag', flag: 'cheap_done' },
      { kind: 'flagDelta', flag: 'body.sinking.cond', delta: 6 },
    ],
    onLapse: [{ kind: 'flag', flag: 'cheap_lapsed' }],
  },
  {
    id: 'init.gated',
    titleKey: 'init.gated.title',
    descKey: 'init.gated.desc',
    completeKey: 'init.gated.complete',
    lapseKey: 'init.gated.lapse',
    required: 20,
    minCycles: 4,
    available: { minLevel: 3 },
    onComplete: [{ kind: 'stat', stat: 'reputation', delta: 5 }],
    onLapse: [],
  },
  {
    id: 'init.capped',
    titleKey: 'init.capped.title',
    descKey: 'init.capped.desc',
    completeKey: 'init.capped.complete',
    lapseKey: 'init.capped.lapse',
    required: 12,
    minCycles: 6,
    available: {},
    onComplete: [{ kind: 'flag', flag: 'capped_done' }],
    onLapse: [],
  },
];

export function makeTestRegistry(): ContentRegistry {
  const departments = Object.fromEntries(
    DEPARTMENT_IDS.map((id) => [id, department(id)]),
  ) as Record<DepartmentId, Department>;

  return {
    departments,
    posts: testPosts,
    tasks: Object.fromEntries(testTasks.map((t) => [t.id, t])),
    events: Object.fromEntries(testEvents.map((e) => [e.id, e])),
    staffNames: ['Ada Fixture', 'Bo Sample', 'Cato Stub', 'Dita Mock', 'Enzo Proxy'],
    bodies: testBodies,
    initiatives: testInitiatives,
  };
}

/** A registry with no events at all, for testing turns that shouldn't be interrupted. */
export function makeQuietRegistry(): ContentRegistry {
  return { ...makeTestRegistry(), events: {} };
}
