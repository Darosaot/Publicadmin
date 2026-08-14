import { defineTask } from '../authoring';

export const legalTasks = [
  defineTask('task.legal.contract_review', {
    title: 'Contract review',
    desc: 'Forty pages of clauses drafted by the supplier’s lawyers, who were paid rather more than you are.',
    departments: ['legal'],
    baseEffort: 6,
    deadlineRange: [2, 4],
    difficulty: 2,
    weight: 13,
    onComplete: {
      poor: [{ kind: 'queueEvent', eventId: 'evt.followup.internal_review', delayTurns: 3 }],
    },
    onFail: [{ kind: 'queueEvent', eventId: 'evt.followup.supplier_challenge', delayTurns: 1 }],
  }),

  defineTask('task.legal.appeal', {
    title: 'Licensing appeal',
    desc: 'A refused permit, an angry applicant, and a deadline set by statute rather than by anyone you can negotiate with.',
    departments: ['legal'],
    maxLevel: 3,
    baseEffort: 7,
    deadlineRange: [2, 4],
    difficulty: 2,
    weight: 11,
    onFail: [{ kind: 'queueEvent', eventId: 'evt.followup.complaint', delayTurns: 1 }],
  }),

  defineTask('task.legal.opinion', {
    title: 'Legal opinion',
    desc: 'The director wants to know whether something can be done. The honest answer has three conditions and nobody wants to hear any of them.',
    departments: ['legal'],
    baseEffort: 4,
    deadlineRange: [2, 3],
    difficulty: 2,
    weight: 13,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'politicalCapital', delta: 2 }],
    },
  }),

  defineTask('task.legal.byelaw', {
    title: 'Byelaw revision',
    desc: 'The parking regulation has been amended so many times that nobody can say with confidence what it currently means.',
    departments: ['legal'],
    baseEffort: 8,
    deadlineRange: [3, 5],
    difficulty: 2,
    weight: 9,
  }),

  defineTask('task.legal.litigation', {
    title: 'Litigation bundle',
    desc: 'The case goes before the administrative court next month. Everything the council did must be assembled, indexed, and defensible.',
    departments: ['legal'],
    baseEffort: 10,
    deadlineRange: [2, 4],
    difficulty: 3,
    weight: 8,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'reputation', delta: 3 }],
    },
    onFail: [
      { kind: 'stat', stat: 'reputation', delta: -3 },
      { kind: 'queueEvent', eventId: 'evt.followup.reprimand', delayTurns: 1 },
    ],
  }),

  defineTask('task.legal.data_protection', {
    title: 'Data protection assessment',
    desc: 'A new system will process personal data on eleven thousand residents. Someone has to write down exactly why that is lawful.',
    departments: ['legal'],
    baseEffort: 7,
    deadlineRange: [3, 4],
    difficulty: 2,
    weight: 10,
    onFail: [{ kind: 'queueEvent', eventId: 'evt.followup.audit_letter', delayTurns: 2 }],
  }),

  defineTask('task.legal.land_dispute', {
    title: 'Land registry dispute',
    desc: 'Two neighbours, one boundary, and a municipal map last surveyed in 1974.',
    departments: ['legal'],
    maxLevel: 3,
    baseEffort: 9,
    deadlineRange: [3, 5],
    difficulty: 3,
    weight: 7,
  }),

  defineTask('task.legal.framework_terms', {
    title: 'Framework terms and conditions',
    desc: 'Standard clauses for every contract the administration will sign for the next four years. Get one wrong and you get it wrong four hundred times.',
    departments: ['legal'],
    minLevel: 2,
    baseEffort: 9,
    deadlineRange: [3, 5],
    difficulty: 3,
    weight: 9,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'reputation', delta: 3 }],
      poor: [{ kind: 'queueEvent', eventId: 'evt.followup.internal_review', delayTurns: 4 }],
    },
  }),
];
