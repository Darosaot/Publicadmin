import { defineTask } from '../authoring';

export const projectsTasks = [
  defineTask('task.projects.milestone_report', {
    title: 'Milestone report',
    desc: 'The funding programme wants evidence that month six happened. Month six did happen, but not quite in the order the application promised.',
    departments: ['projects'],
    baseEffort: 6,
    deadlineRange: [2, 3],
    difficulty: 2,
    weight: 13,
    onFail: [{ kind: 'queueEvent', eventId: 'evt.followup.audit_letter', delayTurns: 2 }],
  }),

  defineTask('task.projects.grant_application', {
    title: 'Grant application',
    desc: 'Sixty pages, four annexes, and a budget table that must add up in three different currencies of optimism.',
    departments: ['projects'],
    baseEffort: 9,
    deadlineRange: [2, 4],
    difficulty: 3,
    weight: 11,
    onComplete: {
      excellent: [
        { kind: 'stat', stat: 'reputation', delta: 3 },
        { kind: 'stat', stat: 'politicalCapital', delta: 2 },
      ],
    },
  }),

  defineTask('task.projects.partner_coordination', {
    title: 'Partner coordination',
    desc: 'Five organisations in four countries, one shared deliverable, and a partner who has stopped answering emails.',
    departments: ['projects'],
    baseEffort: 5,
    deadlineRange: [2, 3],
    difficulty: 2,
    weight: 12,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'politicalCapital', delta: 3 }],
    },
  }),

  defineTask('task.projects.budget_revision', {
    title: 'Project budget revision',
    desc: 'Money must move between headings before the year closes, and every movement needs a justification the funder will accept.',
    departments: ['projects'],
    baseEffort: 7,
    deadlineRange: [2, 3],
    difficulty: 2,
    weight: 10,
  }),

  defineTask('task.projects.eligibility_check', {
    title: 'Eligibility check',
    desc: 'Four hundred invoices, each of which is either eligible expenditure or a future finding in an audit report.',
    departments: ['projects'],
    baseEffort: 8,
    deadlineRange: [3, 4],
    difficulty: 3,
    weight: 10,
    onComplete: {
      poor: [{ kind: 'queueEvent', eventId: 'evt.followup.audit_letter', delayTurns: 3 }],
    },
    onFail: [{ kind: 'queueEvent', eventId: 'evt.followup.audit_letter', delayTurns: 1 }],
  }),

  defineTask('task.projects.payment_claim', {
    title: 'Interim payment claim',
    desc: 'The administration has spent the money. Getting it back requires proving that in the format the programme prescribes.',
    departments: ['projects'],
    maxLevel: 4,
    baseEffort: 7,
    deadlineRange: [2, 3],
    difficulty: 2,
    weight: 11,
    onFail: [
      { kind: 'stat', stat: 'politicalCapital', delta: -3 },
      { kind: 'queueEvent', eventId: 'evt.followup.councillor_question', delayTurns: 1 },
    ],
  }),

  defineTask('task.projects.site_visit', {
    title: 'Monitoring visit',
    desc: 'A day on site, a checklist, and the growing suspicion that the works you are inspecting are three months behind what the reports say.',
    departments: ['projects'],
    maxLevel: 3,
    baseEffort: 5,
    deadlineRange: [3, 4],
    difficulty: 1,
    weight: 9,
  }),

  defineTask('task.projects.closure_dossier', {
    title: 'Project closure dossier',
    desc: 'Everything the project ever produced, assembled in one file that will be kept for ten years and opened by an auditor in year eight.',
    departments: ['projects'],
    minLevel: 2,
    baseEffort: 10,
    deadlineRange: [3, 5],
    difficulty: 3,
    weight: 9,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'reputation', delta: 3 }],
    },
    onFail: [{ kind: 'queueEvent', eventId: 'evt.followup.audit_letter', delayTurns: 2 }],
  }),
];
