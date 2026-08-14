import { defineTask } from '../authoring';

export const policyTasks = [
  defineTask('task.policy.council_brief', {
    title: 'Council brief',
    desc: 'Two pages for someone who will read one of them, ten minutes before speaking about it in public.',
    departments: ['policy'],
    maxLevel: 3,
    baseEffort: 5,
    deadlineRange: [2, 2],
    difficulty: 1,
    weight: 12,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'politicalCapital', delta: 2 }],
    },
  }),

  defineTask('task.policy.consultation', {
    title: 'Public consultation',
    desc: 'Six weeks of submissions from residents, associations and one man who writes every week about the same roundabout.',
    departments: ['policy'],
    baseEffort: 7,
    deadlineRange: [3, 4],
    difficulty: 2,
    weight: 11,
    onFail: [{ kind: 'queueEvent', eventId: 'evt.followup.complaint', delayTurns: 1 }],
  }),

  defineTask('task.policy.strategy_paper', {
    title: 'Strategy paper',
    desc: 'A ten-year vision for something that will be reorganised in three. It still has to be good.',
    departments: ['policy'],
    baseEffort: 9,
    deadlineRange: [3, 5],
    difficulty: 3,
    weight: 10,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'reputation', delta: 3 }],
    },
  }),

  defineTask('task.policy.impact_assessment', {
    title: 'Impact assessment',
    desc: 'What the proposed measure will actually do to the people it applies to, as opposed to what the press release says it will do.',
    departments: ['policy'],
    baseEffort: 8,
    deadlineRange: [3, 4],
    difficulty: 3,
    weight: 10,
  }),

  defineTask('task.policy.question_response', {
    title: 'Answer to a formal question',
    desc: 'A councillor has asked something pointed in writing. The answer must be true, complete, and give away nothing that was not asked.',
    departments: ['policy'],
    baseEffort: 5,
    deadlineRange: [2, 2],
    difficulty: 2,
    weight: 12,
    onFail: [{ kind: 'queueEvent', eventId: 'evt.followup.councillor_question', delayTurns: 1 }],
  }),

  defineTask('task.policy.roundtable', {
    title: 'Stakeholder roundtable',
    desc: 'Eleven organisations around a table, each of which has been told this is the meeting where their concern will be addressed.',
    departments: ['policy'],
    baseEffort: 6,
    deadlineRange: [2, 4],
    difficulty: 2,
    weight: 10,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'politicalCapital', delta: 3 }],
    },
  }),

  defineTask('task.policy.position_paper', {
    title: 'Position paper',
    desc: 'The administration’s formal view, to be defended in a forum where every other administration has brought one too.',
    departments: ['policy'],
    minLevel: 2,
    baseEffort: 8,
    deadlineRange: [3, 4],
    difficulty: 3,
    weight: 10,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'politicalCapital', delta: 3 }],
    },
  }),

  defineTask('task.policy.annual_review', {
    title: 'Annual policy review',
    desc: 'Which of last year’s commitments were met, in a document that must be honest enough to be useful and diplomatic enough to be published.',
    departments: ['policy'],
    baseEffort: 9,
    deadlineRange: [3, 5],
    difficulty: 2,
    weight: 8,
    onComplete: {
      poor: [{ kind: 'queueEvent', eventId: 'evt.followup.press_question', delayTurns: 2 }],
    },
    onFail: [{ kind: 'queueEvent', eventId: 'evt.followup.reprimand', delayTurns: 1 }],
  }),
];
