import { defineTask } from '../authoring';

/**
 * Inspection: the desk that arrives somewhere else.
 *
 * The distinctive thing about this work is that the subject is another administration, staffed by
 * people doing the job the player has done. Failure here is not a missed deadline in your own
 * building — it is a body that carries on doing the thing for another two years because nobody
 * wrote it down in time.
 */
export const inspectionTasks = [
  defineTask('task.inspection.visit', {
    title: 'On-site inspection',
    desc: 'Two days at a body that has cleared a diary, tidied a filing room and put out biscuits. The whole skill is asking the question nobody rehearsed an answer to.',
    departments: ['inspection'],
    baseEffort: 7,
    deadlineRange: [2, 4],
    difficulty: 3,
    weight: 13,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'integrity', delta: 2 }],
    },
  }),

  defineTask('task.inspection.report', {
    title: 'Inspection report',
    desc: 'Everything you found, in an order that makes it actionable, in language that survives being quoted back at you by their lawyers.',
    departments: ['inspection'],
    baseEffort: 8,
    deadlineRange: [3, 4],
    difficulty: 2,
    weight: 12,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'reputation', delta: 3 }],
      poor: [{ kind: 'queueEvent', eventId: 'evt.followup.complaint', delayTurns: 2 }],
    },
    onFail: [{ kind: 'stat', stat: 'integrity', delta: -2 }],
  }),

  defineTask('task.inspection.recommendations', {
    title: 'Follow-up on last year’s recommendations',
    desc: 'Eleven recommendations, accepted in full twelve months ago. Establishing how many were actually implemented takes considerably longer than making them did.',
    departments: ['inspection'],
    baseEffort: 6,
    deadlineRange: [3, 5],
    difficulty: 2,
    weight: 11,
  }),

  defineTask('task.inspection.evidence_log', {
    title: 'Evidence log',
    desc: 'Every document, who gave it to you, when, and what it was said to show. Dull, and the only reason a contested finding ever survives.',
    departments: ['inspection'],
    maxLevel: 3,
    baseEffort: 5,
    deadlineRange: [2, 3],
    difficulty: 2,
    weight: 12,
    onFail: [{ kind: 'stat', stat: 'integrity', delta: -2 }],
  }),

  defineTask('task.inspection.notification', {
    title: 'Notification pack',
    desc: 'The letter telling a body it is being inspected, the scope, and the twenty-nine documents they must produce. It is a form, and getting the scope wrong wastes a fortnight of everyone’s life.',
    departments: ['inspection'],
    maxLevel: 3,
    baseEffort: 4,
    deadlineRange: [2, 3],
    difficulty: 2,
    weight: 11,
  }),

  defineTask('task.inspection.factual_accuracy', {
    title: 'Factual accuracy process',
    desc: 'The body has forty comments on the draft. Nine are corrections you must make, and thirty-one are attempts to soften a finding by objecting to a comma.',
    departments: ['inspection'],
    baseEffort: 7,
    deadlineRange: [2, 3],
    difficulty: 3,
    weight: 11,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'integrity', delta: 3 }],
    },
  }),

  defineTask('task.inspection.referral', {
    title: 'Referral to the authorities',
    desc: 'What you found is beyond a recommendation. Writing the referral means being right, in a form somebody else will act on, about something that will end at least one career.',
    departments: ['inspection'],
    minLevel: 2,
    baseEffort: 9,
    deadlineRange: [2, 4],
    difficulty: 3,
    weight: 10,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'reputation', delta: 4 }],
    },
    onFail: [
      { kind: 'stat', stat: 'integrity', delta: -3 },
      { kind: 'queueEvent', eventId: 'evt.followup.internal_review', delayTurns: 2 },
    ],
  }),

  defineTask('task.inspection.thematic', {
    title: 'Thematic review',
    desc: 'Not one body but fourteen, on one question, looking for the pattern none of them can see from inside. It is the most useful thing the office does and the hardest to resource.',
    departments: ['inspection'],
    minLevel: 3,
    baseEffort: 11,
    deadlineRange: [3, 5],
    difficulty: 3,
    weight: 10,
    onComplete: {
      excellent: [
        { kind: 'stat', stat: 'reputation', delta: 4 },
        { kind: 'stat', stat: 'integrity', delta: 2 },
      ],
    },
  }),
];
