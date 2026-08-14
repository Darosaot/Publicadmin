import { defineTask } from '../authoring';

/**
 * Social services: the desk where the file is a person.
 *
 * That is the whole difference and it is not a small one. Everywhere else a missed deadline is a
 * document waiting in a tray; here it is a family waiting. So the failure effects on this board are
 * weighted toward integrity and stress rather than performance — the cost of not getting to
 * something is not mainly professional.
 */
export const socialTasks = [
  defineTask('task.social.assessment', {
    title: 'Needs assessment',
    desc: 'Ninety minutes in somebody’s front room, and a form afterwards that decides what they get for the next two years.',
    departments: ['social'],
    baseEffort: 6,
    deadlineRange: [2, 4],
    difficulty: 2,
    weight: 13,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'integrity', delta: 2 }],
    },
    onFail: [{ kind: 'stat', stat: 'stress', delta: 5 }],
  }),

  defineTask('task.social.panel', {
    title: 'Placement panel',
    desc: 'Six cases, four places and a chair who wants it done by four o’clock. Every decision is between people rather than between options.',
    departments: ['social'],
    baseEffort: 7,
    deadlineRange: [2, 4],
    difficulty: 3,
    weight: 12,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'reputation', delta: 3 }],
      poor: [{ kind: 'stat', stat: 'stress', delta: 4 }],
    },
    onFail: [
      { kind: 'stat', stat: 'integrity', delta: -2 },
      { kind: 'stat', stat: 'stress', delta: 6 },
    ],
  }),

  defineTask('task.social.safeguarding', {
    title: 'Safeguarding referral',
    desc: 'A concern raised by somebody who was not sure whether to raise it. Getting this wrong in either direction is the thing that wakes you at four in the morning for years.',
    departments: ['social'],
    baseEffort: 8,
    deadlineRange: [2, 4],
    difficulty: 3,
    weight: 12,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'integrity', delta: 4 }],
    },
    onFail: [
      { kind: 'stat', stat: 'integrity', delta: -4 },
      { kind: 'stat', stat: 'stress', delta: 9 },
      { kind: 'queueEvent', eventId: 'evt.followup.investigation', delayTurns: 2 },
    ],
  }),

  defineTask('task.social.case_notes', {
    title: 'Case recording',
    desc: 'The visits you have already done, written up properly. It is the part everyone leaves until Friday and the only part that exists once you leave the service.',
    departments: ['social'],
    maxLevel: 3,
    baseEffort: 5,
    deadlineRange: [2, 4],
    difficulty: 1,
    weight: 13,
    onFail: [{ kind: 'stat', stat: 'integrity', delta: -2 }],
  }),

  defineTask('task.social.benefit_check', {
    title: 'Entitlement check',
    desc: 'Forty minutes of arithmetic that finds a family eleven hundred euros a year they did not know they were owed. Nobody has ever thanked the department for it.',
    departments: ['social'],
    maxLevel: 3,
    baseEffort: 4,
    deadlineRange: [2, 3],
    difficulty: 1,
    weight: 12,
  }),

  defineTask('task.social.review', {
    title: 'Statutory review',
    desc: 'A case reviewed on the schedule the law sets, whether or not anything has changed. Most of them have not. One of them has, badly, and you cannot tell which from the file.',
    departments: ['social'],
    baseEffort: 6,
    deadlineRange: [2, 4],
    difficulty: 2,
    weight: 11,
    onFail: [
      { kind: 'stat', stat: 'integrity', delta: -3 },
      { kind: 'stat', stat: 'stress', delta: 5 },
    ],
  }),

  defineTask('task.social.provider_review', {
    title: 'Provider quality review',
    desc: 'The agency delivering care to two hundred people is cheap and the complaints have doubled. Both of those facts are in your gift to do something about.',
    departments: ['social'],
    minLevel: 2,
    baseEffort: 8,
    deadlineRange: [3, 4],
    difficulty: 2,
    weight: 10,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'integrity', delta: 3 }],
    },
  }),

  defineTask('task.social.serious_case', {
    title: 'Serious case review',
    desc: 'Something went badly wrong and the review has to say why, in public, without turning into either a whitewash or a search for one person to blame.',
    departments: ['social'],
    minLevel: 3,
    baseEffort: 11,
    deadlineRange: [3, 5],
    difficulty: 3,
    weight: 10,
    onComplete: {
      excellent: [
        { kind: 'stat', stat: 'integrity', delta: 5 },
        { kind: 'stat', stat: 'reputation', delta: 3 },
      ],
      poor: [{ kind: 'queueEvent', eventId: 'evt.followup.press_question', delayTurns: 1 }],
    },
    onFail: [
      { kind: 'stat', stat: 'reputation', delta: -4 },
      { kind: 'stat', stat: 'stress', delta: 10 },
      { kind: 'queueEvent', eventId: 'evt.followup.press_question', delayTurns: 1 },
    ],
  }),
];
