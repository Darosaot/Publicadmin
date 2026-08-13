import type { Department, DepartmentId } from '../engine/types';
import { defineDepartment } from './authoring';

/**
 * The five desks. Your choice is permanent: it decides the work that lands in front of you, the
 * trouble that finds you, and the one crisis that is waiting somewhere in your career.
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

  policy: defineDepartment('policy', {
    name: 'Policy',
    blurb: 'Council briefs, strategy papers, consultations and the art of the defensible sentence.',
    flavour:
      'Your words end up in the council chamber with someone else’s name on them. That is the ' +
      'job. Occasionally one of them changes something, and you never find out which.',
    startingAdjustments: { politicalCapital: 4, reputation: 2, performance: -2 },
  }),
};

export const departmentList: Department[] = [
  departments.legal,
  departments.projects,
  departments.finance,
  departments.procurement,
  departments.policy,
];
