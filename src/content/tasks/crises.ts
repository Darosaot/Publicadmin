import { defineTask } from '../authoring';

/**
 * Files with teeth.
 *
 * These never appear because the board refilled. Each one is put on the desk by an event, which
 * is the whole difference: ordinary work arrives at a rate the post is designed to absorb, and a
 * crisis arrives because something has already gone wrong somewhere you were not looking.
 *
 * Three properties follow, and all three are the point:
 *
 * - **They cannot be declined or cut back.** You may ask for more time, which is what everybody
 *   does and which is priced. A crisis you can hand back is not a crisis.
 * - **They are far bigger than a file.** Two to three months of a senior desk, which means the
 *   rest of the board suffers for as long as one is open. That is what "sustained commitment"
 *   means in a game whose only real currency is the month.
 * - **Failing one costs what it says, not the standard penalty.** Ordinary missed work schedules
 *   an awkward follow-up. Missing these costs standing, integrity or the unit itself.
 *
 * The weight is zero throughout: `refillBoard` filters crises out entirely, and a non-zero weight
 * would be a lie about how they arrive rather than a bug.
 */
export const crisisTasks = [
  defineTask('task.crisis.inquiry', {
    title: 'The inquiry',
    desc: 'A decision taken four years ago is now being examined line by line by people with subpoena powers and no deadline of their own. Everything you send is permanent.',
    departments: 'any',
    minLevel: 3,
    baseEffort: 26,
    deadlineRange: [3, 3],
    difficulty: 3,
    weight: 0,
    crisis: true,
    onComplete: {
      excellent: [
        { kind: 'stat', stat: 'reputation', delta: 8 },
        { kind: 'stat', stat: 'integrity', delta: 4 },
      ],
      good: [{ kind: 'stat', stat: 'reputation', delta: 3 }],
    },
    onFail: [
      { kind: 'stat', stat: 'reputation', delta: -14 },
      { kind: 'stat', stat: 'integrity', delta: -6 },
      { kind: 'queueEvent', eventId: 'evt.crisis.inquiry_failed', delayTurns: 1 },
    ],
  }),

  defineTask('task.crisis.migration', {
    title: 'The system that will not migrate',
    desc: 'Eleven years of records, a supplier who has stopped answering, and a switch-off date somebody agreed to in writing before you arrived.',
    departments: 'any',
    minLevel: 3,
    baseEffort: 24,
    deadlineRange: [3, 3],
    difficulty: 3,
    weight: 0,
    crisis: true,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'performance', delta: 8 }],
      good: [{ kind: 'stat', stat: 'performance', delta: 4 }],
    },
    onFail: [
      { kind: 'stat', stat: 'performance', delta: -12 },
      { kind: 'stat', stat: 'reputation', delta: -8 },
      { kind: 'teamMorale', delta: -12 },
    ],
  }),

  defineTask('task.crisis.safeguarding', {
    title: 'The case that was missed',
    desc: 'A file that passed through three teams, including one of yours, and stopped somewhere it should not have. Everything about this is now urgent and nothing about it is now fixable.',
    departments: ['social', 'inspection', 'legal'],
    minLevel: 3,
    baseEffort: 22,
    deadlineRange: [2, 2],
    difficulty: 3,
    weight: 0,
    crisis: true,
    onComplete: {
      excellent: [
        { kind: 'stat', stat: 'integrity', delta: 6 },
        { kind: 'stat', stat: 'reputation', delta: 4 },
      ],
      good: [{ kind: 'stat', stat: 'integrity', delta: 3 }],
    },
    onFail: [
      { kind: 'stat', stat: 'reputation', delta: -16 },
      { kind: 'stat', stat: 'stress', delta: 12 },
      { kind: 'queueEvent', eventId: 'evt.crisis.safeguarding_failed', delayTurns: 1 },
    ],
  }),

  defineTask('task.crisis.clawback', {
    title: 'The money that has to go back',
    desc: 'A grant condition nobody read closely, four years of spending against it, and an auditor who has read it very closely indeed.',
    departments: ['finance', 'procurement', 'projects'],
    minLevel: 3,
    baseEffort: 20,
    deadlineRange: [3, 3],
    difficulty: 3,
    weight: 0,
    crisis: true,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'politicalCapital', delta: 8 }],
      good: [{ kind: 'stat', stat: 'politicalCapital', delta: 3 }],
    },
    onFail: [
      { kind: 'budgetMonthly', delta: -1800 },
      { kind: 'stat', stat: 'reputation', delta: -10 },
    ],
  }),
];
