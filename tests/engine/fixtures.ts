/**
 * A small hand-built registry for engine tests.
 *
 * Testing against fixtures rather than the shipped content means a balance tweak or a new event
 * can't turn an engine test red for reasons that have nothing to do with the engine.
 */

import type { ContentRegistry } from '../../src/engine/registry';
import type {
  CareerLevel,
  Department,
  DepartmentId,
  GameEvent,
  TaskTemplate,
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

export const testCareerLevels: CareerLevel[] = [
  {
    level: 1,
    titleKey: 'career.1.title',
    orgKey: 'career.1.org',
    orgShortKey: 'career.1.org_short',
    baseSalary: 2100,
    effortPoints: 10,
    taskSlots: 3,
  },
  {
    level: 2,
    titleKey: 'career.2.title',
    orgKey: 'career.2.org',
    orgShortKey: 'career.2.org_short',
    baseSalary: 2900,
    effortPoints: 11,
    taskSlots: 4,
    promotion: { minReputation: 35, minPerformance: 50, minTurnsAtLevel: 8 },
  },
  {
    level: 3,
    titleKey: 'career.3.title',
    orgKey: 'career.3.org',
    orgShortKey: 'career.3.org_short',
    baseSalary: 3900,
    effortPoints: 12,
    taskSlots: 4,
    promotion: {
      minReputation: 50,
      minPerformance: 55,
      minPoliticalCapital: 25,
      minTurnsAtLevel: 10,
    },
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

export function makeTestRegistry(): ContentRegistry {
  const departments = Object.fromEntries(
    DEPARTMENT_IDS.map((id) => [id, department(id)]),
  ) as Record<DepartmentId, Department>;

  return {
    departments,
    careerLevels: testCareerLevels,
    tasks: Object.fromEntries(testTasks.map((t) => [t.id, t])),
    events: Object.fromEntries(testEvents.map((e) => [e.id, e])),
  };
}

/** A registry with no events at all, for testing turns that shouldn't be interrupted. */
export function makeQuietRegistry(): ContentRegistry {
  return { ...makeTestRegistry(), events: {} };
}
