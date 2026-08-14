import { DEPARTMENT_IDS, type Department, type DepartmentId } from '../engine/types';
import { defineDepartment } from './authoring';

/**
 * The desks. Your choice is permanent: it decides the work that lands in front of you, the
 * trouble that finds you, and the one crisis waiting somewhere in your career.
 */
export const departments: Record<DepartmentId, Department> = {
  legal: defineDepartment('legal', {
    name: 'Legal',
    blurb: 'Contracts, appeals, opinions and the slow machinery of administrative law.',
    flavour:
      'The rules are your instrument. You will be right more often than you are thanked, and the ' +
      'people who need you most are the people who resent you for it.',
    startingAdjustments: { integrity: 6, politicalCapital: -3 },
  }),

  projects: defineDepartment('projects', {
    name: 'Projects',
    blurb: 'EU-funded programmes, milestones, partners and reporting deadlines that do not move.',
    flavour:
      'You are the person who makes things actually happen, which means you are also the person ' +
      'who decides what gets rounded off to make them happen on time.',
    startingAdjustments: { politicalCapital: 6, integrity: -3 },
  }),

  finance: defineDepartment('finance', {
    name: 'Finance',
    blurb: 'The budget cycle, invoices, treasury, and the annual ordeal of closing the year.',
    flavour:
      'You say no for a living. Everyone in this building has a plan, and you are the reason ' +
      'roughly half of them will not survive contact with the ledger.',
    startingAdjustments: { performance: 6, reputation: -3 },
  }),

  procurement: defineDepartment('procurement', {
    name: 'Procurement',
    blurb: 'Tenders, evaluation committees, framework agreements and very attentive suppliers.',
    flavour:
      'Everyone watches procurement. Auditors, journalists, losing bidders, and at least one ' +
      'councillor with a cousin in construction. Sign nothing you have not read twice.',
    startingAdjustments: { reputation: 6, stress: 3 },
  }),

  inspection: defineDepartment('inspection', {
    name: 'Inspection',
    blurb:
      'Visits, findings, recommendations, and the long business of finding out whether anything ' +
      'changed after the last report.',
    flavour:
      'You are the one who arrives. Everyone is very slightly more careful than usual for the two ' +
      'days you are there, and your whole skill is asking the question they have not rehearsed.',
    startingAdjustments: { integrity: 8, politicalCapital: -5 },
  }),

  social: defineDepartment('social', {
    name: 'Social services',
    blurb: 'Assessments, placements, safeguarding panels and a caseload that is made of people.',
    flavour:
      'Every file on this desk is somebody. That is the entire difference, and it is not a small ' +
      'one: the thing you do not get to on Friday is not a document waiting patiently in a tray.',
    startingAdjustments: { integrity: 4, stress: 6, reputation: -2 },
  }),

  policy: defineDepartment('policy', {
    name: 'Policy',
    blurb: 'Council briefs, strategy papers, consultations and the art of the defensible sentence.',
    flavour:
      'Your words end up in the council chamber with someone else’s name on them. That is the ' +
      'job. Occasionally one of them changes something, and you never find out which.',
    startingAdjustments: { politicalCapital: 4, reputation: 2, performance: -2 },
  }),
};

/**
 * Derived rather than written out.
 *
 * This was a hand-maintained parallel array, and nothing validated it — a department added to the
 * record above but forgotten here would compile, pass every test, and simply never appear on the
 * new-game screen.
 */
export const departmentList: Department[] = DEPARTMENT_IDS.map((id) => departments[id]);
