import { defineTask } from '../authoring';

export const procurementTasks = [
  defineTask('task.procurement.specification', {
    title: 'Tender specification',
    desc: 'Describe what the administration needs precisely enough to get it, and generally enough that only one company cannot possibly qualify.',
    departments: ['procurement'],
    baseEffort: 7,
    deadlineRange: [2, 4],
    difficulty: 2,
    weight: 13,
    onComplete: {
      poor: [{ kind: 'queueEvent', eventId: 'evt.followup.supplier_challenge', delayTurns: 2 }],
    },
  }),

  defineTask('task.procurement.evaluation', {
    title: 'Evaluation committee',
    desc: 'Six bids, four evaluators, and a scoring grid that will be read very carefully by whoever comes second.',
    departments: ['procurement'],
    baseEffort: 8,
    deadlineRange: [2, 3],
    difficulty: 3,
    weight: 12,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'reputation', delta: 3 }],
      poor: [{ kind: 'queueEvent', eventId: 'evt.followup.supplier_challenge', delayTurns: 1 }],
    },
    onFail: [{ kind: 'queueEvent', eventId: 'evt.followup.supplier_challenge', delayTurns: 1 }],
  }),

  defineTask('task.procurement.framework_renewal', {
    title: 'Framework renewal',
    desc: 'The cleaning contract expires in eleven weeks. Nobody noticed until this morning.',
    departments: ['procurement'],
    baseEffort: 6,
    deadlineRange: [2, 3],
    difficulty: 2,
    weight: 11,
    onFail: [
      { kind: 'stat', stat: 'reputation', delta: -2 },
      { kind: 'queueEvent', eventId: 'evt.followup.councillor_question', delayTurns: 1 },
    ],
  }),

  defineTask('task.procurement.clarifications', {
    title: 'Bidder clarifications',
    desc: 'Thirty-one written questions, each of which must be answered to every bidder at once, in writing, without giving anything away.',
    departments: ['procurement'],
    maxLevel: 3,
    baseEffort: 5,
    deadlineRange: [2, 2],
    difficulty: 2,
    weight: 12,
  }),

  defineTask('task.procurement.award_publication', {
    title: 'Award publication',
    desc: 'The decision is made. Publishing it correctly is what stands between the administration and a very expensive procedural annulment.',
    departments: ['procurement'],
    maxLevel: 3,
    baseEffort: 4,
    deadlineRange: [2, 2],
    difficulty: 2,
    weight: 11,
    onFail: [{ kind: 'queueEvent', eventId: 'evt.followup.supplier_challenge', delayTurns: 1 }],
  }),

  defineTask('task.procurement.supplier_review', {
    title: 'Supplier performance review',
    desc: 'The contractor has been late on every milestone and charming about all of them. The file should say so.',
    departments: ['procurement'],
    baseEffort: 6,
    deadlineRange: [3, 4],
    difficulty: 2,
    weight: 9,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'integrity', delta: 2 }],
    },
  }),

  defineTask('task.procurement.direct_award', {
    title: 'Direct award justification',
    desc: 'The department wants to skip the tender. The law allows it in narrow circumstances, and someone must write down which one applies.',
    departments: ['procurement'],
    baseEffort: 6,
    deadlineRange: [2, 3],
    difficulty: 3,
    weight: 10,
    onComplete: {
      poor: [{ kind: 'queueEvent', eventId: 'evt.followup.audit_letter', delayTurns: 3 }],
    },
  }),

  defineTask('task.procurement.challenge_response', {
    title: 'Response to a challenge',
    desc: 'A losing bidder has formally contested the award. Every note you took during the evaluation now belongs to the file.',
    departments: ['procurement'],
    minLevel: 2,
    baseEffort: 9,
    deadlineRange: [2, 3],
    difficulty: 3,
    weight: 10,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'reputation', delta: 4 }],
    },
    onFail: [
      { kind: 'stat', stat: 'reputation', delta: -3 },
      { kind: 'queueEvent', eventId: 'evt.followup.press_question', delayTurns: 1 },
    ],
  }),
];
