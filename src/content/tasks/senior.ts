import { defineTask } from '../authoring';

/**
 * The work of a senior post.
 *
 * The point of this band is that the desk should be visibly different from the one you sat at as
 * a junior officer. Nobody at Director-General level is clearing an inbox backlog; they are
 * writing the thing that decides what forty people will spend next year doing. These templates
 * gate on level so they only appear once you have climbed to them, and the clerical band is
 * capped so it disappears behind you.
 */
export const seniorTasks = [
  /* ------------------------------------------------- running a unit (L3+) */

  defineTask('task.senior.business_plan', {
    title: 'Unit business plan',
    desc: 'What the unit will achieve next year, in a document that will be used to judge you and to justify your headcount.',
    departments: 'any',
    minLevel: 3,
    baseEffort: 16,
    deadlineRange: [3, 4],
    difficulty: 2,
    weight: 11,
    onComplete: {
      excellent: [
        { kind: 'stat', stat: 'reputation', delta: 2 },
        { kind: 'teamMorale', delta: 4 },
      ],
      poor: [{ kind: 'teamMorale', delta: -4 }],
    },
  }),

  defineTask('task.senior.budget_bid', {
    title: 'Budget bid',
    desc: 'Next year’s allocation is decided in a room you will be in for eleven minutes. This is the paper that speaks for you the rest of the time.',
    departments: 'any',
    minLevel: 3,
    baseEffort: 18,
    deadlineRange: [2, 3],
    difficulty: 3,
    weight: 10,
    onComplete: {
      excellent: [{ kind: 'budgetMonthly', delta: 1200 }, { kind: 'stat', stat: 'reputation', delta: 2 }],
      poor: [{ kind: 'budgetMonthly', delta: -800 }],
    },
    onFail: [
      { kind: 'budgetMonthly', delta: -1200 },
      { kind: 'stat', stat: 'reputation', delta: -2 },
    ],
  }),

  defineTask('task.senior.management_board', {
    title: 'Paper for the management board',
    desc: 'Six pages for people who will read two of them, on a decision that cannot be unmade.',
    departments: 'any',
    minLevel: 3,
    baseEffort: 12,
    deadlineRange: [2, 2],
    difficulty: 2,
    weight: 13,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'politicalCapital', delta: 3 }],
    },
  }),

  defineTask('task.senior.workforce_plan', {
    title: 'Workforce plan',
    desc: 'Which posts you will need in three years, which you will lose, and how you intend to explain the second part to the people in them.',
    departments: 'any',
    minLevel: 3,
    baseEffort: 14,
    deadlineRange: [3, 5],
    difficulty: 2,
    weight: 9,
    onComplete: {
      excellent: [{ kind: 'teamMorale', delta: 5 }],
      poor: [{ kind: 'teamMorale', delta: -6 }],
    },
  }),

  defineTask('task.senior.performance_reporting', {
    title: 'Quarterly performance return',
    desc: 'Your unit’s numbers, assembled for people who will compare them with units doing something entirely different.',
    departments: 'any',
    minLevel: 3,
    baseEffort: 10,
    deadlineRange: [2, 2],
    difficulty: 1,
    weight: 12,
  }),

  defineTask('task.senior.executive_briefing', {
    title: 'Briefing for the executive',
    desc: 'Two pages, tonight, on a subject that has been developing for three years and became urgent this afternoon.',
    departments: 'any',
    minLevel: 4,
    baseEffort: 12,
    deadlineRange: [2, 2],
    difficulty: 3,
    weight: 12,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'politicalCapital', delta: 4 }],
      poor: [{ kind: 'stat', stat: 'politicalCapital', delta: -3 }],
    },
    onFail: [{ kind: 'queueEvent', eventId: 'evt.followup.councillor_question', delayTurns: 1 }],
  }),

  /* --------------------------------------------------- the departments (L4+) */

  defineTask('task.senior.legal_drafting', {
    title: 'Drafting instructions',
    desc: 'What the legislation should do, written precisely enough that parliamentary counsel can turn it into words that will bind people for a generation.',
    departments: ['legal'],
    minLevel: 4,
    baseEffort: 22,
    deadlineRange: [3, 5],
    difficulty: 3,
    weight: 12,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'reputation', delta: 4 }],
    },
  }),

  defineTask('task.senior.legal_risk', {
    title: 'Legal risk register',
    desc: 'Every case the administration could lose, what it would cost, and how likely it is. Read once a year by everyone, in a bad week.',
    departments: ['legal'],
    minLevel: 4,
    baseEffort: 16,
    deadlineRange: [3, 4],
    difficulty: 2,
    weight: 10,
  }),

  defineTask('task.senior.projects_programme', {
    title: 'National programme design',
    desc: 'Four hundred million euros, seven years, and the structure that decides whether any of it reaches anybody.',
    departments: ['projects'],
    minLevel: 4,
    baseEffort: 24,
    deadlineRange: [3, 5],
    difficulty: 3,
    weight: 12,
    onComplete: {
      excellent: [
        { kind: 'stat', stat: 'reputation', delta: 4 },
        { kind: 'stat', stat: 'politicalCapital', delta: 2 },
      ],
    },
  }),

  defineTask('task.senior.projects_portfolio', {
    title: 'Portfolio prioritisation',
    desc: 'Nineteen projects, funding for eleven. The other eight belong to people who will be in the room.',
    departments: ['projects'],
    minLevel: 4,
    baseEffort: 18,
    deadlineRange: [2, 4],
    difficulty: 3,
    weight: 11,
    onComplete: {
      poor: [{ kind: 'stat', stat: 'politicalCapital', delta: -3 }],
    },
  }),

  defineTask('task.senior.finance_spending_review', {
    title: 'Spending review submission',
    desc: 'Justify every euro the directorate spends, to a treasury that has already decided the answer is less.',
    departments: ['finance'],
    minLevel: 4,
    baseEffort: 24,
    deadlineRange: [3, 4],
    difficulty: 3,
    weight: 12,
    onComplete: {
      excellent: [{ kind: 'budgetMonthly', delta: 2000 }, { kind: 'stat', stat: 'reputation', delta: 3 }],
    },
    onFail: [{ kind: 'budgetMonthly', delta: -2500 }],
  }),

  defineTask('task.senior.finance_framework', {
    title: 'Multi-year financial framework',
    desc: 'Three years of numbers for an administration that has never successfully predicted one.',
    departments: ['finance'],
    minLevel: 4,
    baseEffort: 20,
    deadlineRange: [3, 5],
    difficulty: 3,
    weight: 10,
  }),

  defineTask('task.senior.procurement_policy', {
    title: 'Procurement policy reform',
    desc: 'Rewrite the rules everyone complains about, knowing that whatever you replace them with is what they will complain about next.',
    departments: ['procurement'],
    minLevel: 4,
    baseEffort: 22,
    deadlineRange: [3, 5],
    difficulty: 3,
    weight: 12,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'reputation', delta: 4 }, { kind: 'stat', stat: 'integrity', delta: 2 }],
    },
  }),

  defineTask('task.senior.procurement_category', {
    title: 'Category strategy',
    desc: 'How the administration will buy an entire class of things for the next five years, and which suppliers that quietly favours.',
    departments: ['procurement'],
    minLevel: 4,
    baseEffort: 18,
    deadlineRange: [3, 4],
    difficulty: 3,
    weight: 11,
    onComplete: {
      poor: [{ kind: 'queueEvent', eventId: 'evt.followup.supplier_challenge', delayTurns: 3 }],
    },
  }),

  defineTask('task.senior.policy_green_paper', {
    title: 'Green paper',
    desc: 'The administration’s thinking, published for argument. Everything you leave out is a decision, and everyone will notice which.',
    departments: ['policy'],
    minLevel: 4,
    baseEffort: 22,
    deadlineRange: [3, 5],
    difficulty: 3,
    weight: 12,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'reputation', delta: 4 }],
    },
  }),

  defineTask('task.senior.policy_committee', {
    title: 'Appearance before the committee',
    desc: 'Three hours of questions, on the record, about decisions taken by people who no longer work here.',
    departments: ['policy'],
    minLevel: 4,
    baseEffort: 16,
    deadlineRange: [2, 3],
    difficulty: 3,
    weight: 11,
    onComplete: {
      excellent: [{ kind: 'stat', stat: 'reputation', delta: 4 }],
      poor: [{ kind: 'queueEvent', eventId: 'evt.followup.press_question', delayTurns: 1 }],
    },
    onFail: [{ kind: 'stat', stat: 'reputation', delta: -4 }],
  }),
];
