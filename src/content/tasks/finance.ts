import { defineTask } from '../authoring';

export const financeTasks = [
  defineTask('task.finance.monthly_close', {
    title: 'Monthly closing',
    desc: 'The ledger must balance by the eighth. It currently does not, by an amount small enough to be maddening.',
    departments: ['finance'],
    baseEffort: 5,
    deadlineRange: [2, 2],
    difficulty: 2,
    weight: 14,
    onFail: [{ kind: 'queueEvent', eventId: 'evt.followup.reprimand', delayTurns: 1 }],
  }),

  defineTask('task.finance.invoice_backlog', {
    title: 'Invoice backlog',
    desc: 'Suppliers are waiting. Some have been waiting long enough to start writing letters that mention interest.',
    departments: ['finance'],
    baseEffort: 6,
    deadlineRange: [2, 3],
    difficulty: 1,
    weight: 13,
    onFail: [{ kind: 'queueEvent', eventId: 'evt.followup.supplier_challenge', delayTurns: 1 }],
  }),

  defineTask('task.finance.budget_amendment', {
    title: 'Budget amendment',
    desc: 'A department has overspent and another has underspent. Reconciling the two on paper is easy; getting both to sign is not.',
    departments: ['finance'],
    baseEffort: 7,
    deadlineRange: [2, 4],
    difficulty: 2,
    weight: 11,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'politicalCapital', delta: 2 }],
    },
  }),

  defineTask('task.finance.treasury_forecast', {
    title: 'Treasury forecast',
    desc: 'How much cash the administration will have in ninety days, based on payments nobody can promise will arrive.',
    departments: ['finance'],
    baseEffort: 6,
    deadlineRange: [2, 3],
    difficulty: 2,
    weight: 10,
  }),

  defineTask('task.finance.subsidy_review', {
    title: 'Subsidy justification review',
    desc: 'Twelve associations received public money last year. Each was required to prove what they did with it, and nine of them have tried.',
    departments: ['finance'],
    baseEffort: 8,
    deadlineRange: [3, 4],
    difficulty: 2,
    weight: 10,
    onComplete: {
      poor: [{ kind: 'queueEvent', eventId: 'evt.followup.councillor_question', delayTurns: 2 }],
    },
  }),

  defineTask('task.finance.draft_budget', {
    title: 'Draft annual budget',
    desc: 'Every department has asked for more than exists. Your job is to produce a document in which that is not visible.',
    departments: ['finance'],
    baseEffort: 11,
    deadlineRange: [3, 5],
    difficulty: 3,
    weight: 9,
    onComplete: {
      excellent: [
        { kind: 'stat', stat: 'reputation', delta: 3 },
        { kind: 'stat', stat: 'politicalCapital', delta: 2 },
      ],
    },
    onFail: [{ kind: 'queueEvent', eventId: 'evt.followup.councillor_question', delayTurns: 1 }],
  }),

  defineTask('task.finance.reconciliation', {
    title: 'Cost centre reconciliation',
    desc: 'Two systems that were supposed to talk to each other have been quietly disagreeing since March.',
    departments: ['finance'],
    baseEffort: 7,
    deadlineRange: [3, 4],
    difficulty: 3,
    weight: 9,
  }),

  defineTask('task.finance.audit_response', {
    title: 'Audit response file',
    desc: 'The external auditors have eleven observations. Each needs an answer that is accurate, complete, and does not concede more than it must.',
    departments: ['finance'],
    minLevel: 2,
    baseEffort: 9,
    deadlineRange: [2, 4],
    difficulty: 3,
    weight: 10,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'reputation', delta: 3 }],
    },
    onFail: [{ kind: 'queueEvent', eventId: 'evt.followup.audit_letter', delayTurns: 1 }],
  }),
];
