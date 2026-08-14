import type { Post, PromotionRequirement } from '../engine/types';
import { text } from './authoring';

/**
 * The career, as a graph rather than a ladder.
 *
 * Everyone starts at the same desk in Alderford. After that it forks, and the four branches are
 * meant to be different games rather than four labels on the same one:
 *
 * - **line** is what the game already was: more people, more budget, more institution.
 * - **expert** trades the unit away for the hardest files in the building and the standing that
 *   comes with being the person who gets asked. No staff, no budget, considerably more of your
 *   own time.
 * - **political** is fast, well paid and has no tenure. The cycles are short because the work is.
 * - **oversight** turns the game around: you inspect the administrations the other three work
 *   inside. Integrity is the currency and political capital buys very little.
 *
 * `tier` is the old `level` under a better name, and every content gate and scaling formula still
 * keys off it. Posts sharing a tier are alternatives, not steps.
 *
 * Minister is not on this list. At tier 5 the graph runs out and what is left is politics, handled
 * by the confirmation arc in `events/milestones.ts`.
 */

/** Entry terms, named so the tree below reads as a shape rather than a wall of numbers. */
const REQ = {
  toTier2: { minReputation: 35, minPerformance: 50, minTurnsAtLevel: 8 },
  toTier3: { minReputation: 50, minPerformance: 55, minPoliticalCapital: 25, minTurnsAtLevel: 10 },
  toTier4: { minReputation: 65, minPerformance: 60, minPoliticalCapital: 40, minTurnsAtLevel: 12 },
  toTier5: { minReputation: 78, minPerformance: 65, minPoliticalCapital: 55, minTurnsAtLevel: 12 },

  // The political track pays little attention to your record and a great deal to your allies.
  toAdviser: { minReputation: 42, minPerformance: 50, minPoliticalCapital: 35, minTurnsAtLevel: 8 },
  toPrivateOffice: {
    minReputation: 55,
    minPerformance: 55,
    minPoliticalCapital: 55,
    minTurnsAtLevel: 10,
  },
  toCabinet: { minReputation: 68, minPerformance: 58, minPoliticalCapital: 72, minTurnsAtLevel: 10 },

  // Oversight wants a record it can stand behind, and does not care who you know.
  toAudit: { minReputation: 38, minPerformance: 55, minTurnsAtLevel: 8 },
  toSeniorAuditor: { minReputation: 52, minPerformance: 60, minTurnsAtLevel: 10 },
  toInspectorate: { minReputation: 66, minPerformance: 66, minTurnsAtLevel: 12 },
  toOmbudsman: { minReputation: 80, minPerformance: 70, minTurnsAtLevel: 12 },

  // The expert track is bought with the quality of the work and nothing else.
  toPrincipal: { minReputation: 48, minPerformance: 62, minTurnsAtLevel: 10 },
  toChiefAdviser: { minReputation: 62, minPerformance: 70, minTurnsAtLevel: 12 },
  toChiefCounsel: { minReputation: 74, minPerformance: 74, minTurnsAtLevel: 12 },
} satisfies Record<string, PromotionRequirement>;

export const posts: Post[] = [
  /* --------------------------------------------------------------- tier 1 */

  {
    id: 'post.alderford.officer',
    tier: 1,
    track: 'line',
    titleKey: text('post.alderford.officer.title', 'Administrative Officer'),
    orgKey: text('post.alderford.officer.org', 'Alderford City Council'),
    orgShortKey: text('post.alderford.officer.org_short', 'Alderford'),
    baseSalary: 2100,
    effortPoints: 10,
    taskSlots: 4,
    monthsPerTurn: 1,
    from: [],
  },

  /* --------------------------------------------------------------- tier 2 */

  {
    id: 'post.northbridge.senior',
    tier: 2,
    track: 'line',
    titleKey: text('post.northbridge.senior.title', 'Senior Officer'),
    orgKey: text('post.northbridge.senior.org', 'Northbridge City Council'),
    orgShortKey: text('post.northbridge.senior.org_short', 'Northbridge'),
    baseSalary: 2900,
    effortPoints: 12,
    taskSlots: 4,
    monthsPerTurn: 2,
    from: [{ from: 'post.alderford.officer', requires: REQ.toTier2 }],
  },
  {
    id: 'post.audit.case_officer',
    tier: 2,
    track: 'oversight',
    titleKey: text('post.audit.case_officer.title', 'Case Officer'),
    orgKey: text('post.audit.case_officer.org', 'National Audit Authority'),
    orgShortKey: text('post.audit.case_officer.org_short', 'the Audit Authority'),
    baseSalary: 2800,
    effortPoints: 12,
    taskSlots: 4,
    monthsPerTurn: 2,
    from: [{ from: 'post.alderford.officer', requires: REQ.toAudit }],
  },

  /* --------------------------------------------------------------- tier 3 */

  {
    id: 'post.region.head_of_unit',
    tier: 3,
    track: 'line',
    titleKey: text('post.region.head_of_unit.title', 'Head of Unit'),
    orgKey: text('post.region.head_of_unit.org', 'Regional Government of Valmara'),
    orgShortKey: text('post.region.head_of_unit.org_short', 'the Region'),
    baseSalary: 3900,
    effortPoints: 14,
    taskSlots: 6,
    monthsPerTurn: 4,
    headcount: 4,
    monthlyBudget: 11500,
    from: [
      { from: 'post.northbridge.senior', requires: REQ.toTier3 },
      { from: 'post.audit.case_officer', requires: REQ.toTier3, sideways: true },
    ],
  },
  {
    id: 'post.region.principal',
    tier: 3,
    track: 'expert',
    titleKey: text('post.region.principal.title', 'Principal Specialist'),
    orgKey: text('post.region.principal.org', 'Regional Government of Valmara'),
    orgShortKey: text('post.region.principal.org_short', 'the Region'),
    baseSalary: 3800,
    // No unit, so the work is yours: more of your own time against a tighter board of harder files.
    effortPoints: 21,
    taskSlots: 4,
    monthsPerTurn: 4,
    from: [
      { from: 'post.northbridge.senior', requires: REQ.toPrincipal },
      { from: 'post.audit.case_officer', requires: REQ.toPrincipal, sideways: true },
    ],
  },
  {
    id: 'post.ministry.adviser',
    tier: 3,
    track: 'political',
    titleKey: text('post.ministry.adviser.title', 'Adviser'),
    orgKey: text('post.ministry.adviser.org', 'the Minister’s private office'),
    orgShortKey: text('post.ministry.adviser.org_short', 'the private office'),
    baseSalary: 4100,
    // Short cycles and a small board: a private office works in weeks and forgets in months.
    effortPoints: 17,
    taskSlots: 3,
    monthsPerTurn: 3,
    from: [{ from: 'post.northbridge.senior', requires: REQ.toAdviser }],
  },
  {
    id: 'post.audit.senior_auditor',
    tier: 3,
    track: 'oversight',
    titleKey: text('post.audit.senior_auditor.title', 'Senior Auditor'),
    orgKey: text('post.audit.senior_auditor.org', 'National Audit Authority'),
    orgShortKey: text('post.audit.senior_auditor.org_short', 'the Audit Authority'),
    baseSalary: 3700,
    effortPoints: 14,
    taskSlots: 5,
    monthsPerTurn: 4,
    headcount: 3,
    monthlyBudget: 8000,
    from: [
      { from: 'post.audit.case_officer', requires: REQ.toSeniorAuditor },
      { from: 'post.northbridge.senior', requires: REQ.toSeniorAuditor, sideways: true },
    ],
  },

  /* --------------------------------------------------------------- tier 4 */

  {
    id: 'post.agency.head_of_department',
    tier: 4,
    track: 'line',
    titleKey: text('post.agency.head_of_department.title', 'Head of Department'),
    orgKey: text('post.agency.head_of_department.org', 'National Agency for Public Investment'),
    orgShortKey: text('post.agency.head_of_department.org_short', 'the Agency'),
    baseSalary: 5200,
    effortPoints: 16,
    taskSlots: 7,
    monthsPerTurn: 6,
    headcount: 6,
    monthlyBudget: 18500,
    from: [
      { from: 'post.region.head_of_unit', requires: REQ.toTier4 },
      { from: 'post.audit.senior_auditor', requires: REQ.toTier4, sideways: true },
      { from: 'post.region.principal', requires: REQ.toTier4, sideways: true },
    ],
  },
  {
    id: 'post.agency.chief_adviser',
    tier: 4,
    track: 'expert',
    titleKey: text('post.agency.chief_adviser.title', 'Chief Adviser'),
    orgKey: text('post.agency.chief_adviser.org', 'National Agency for Public Investment'),
    orgShortKey: text('post.agency.chief_adviser.org_short', 'the Agency'),
    baseSalary: 5000,
    effortPoints: 25,
    taskSlots: 4,
    monthsPerTurn: 6,
    from: [
      { from: 'post.region.principal', requires: REQ.toChiefAdviser },
      { from: 'post.region.head_of_unit', requires: REQ.toChiefAdviser, sideways: true },
    ],
  },
  {
    id: 'post.ministry.private_office',
    tier: 4,
    track: 'political',
    titleKey: text('post.ministry.private_office.title', 'Head of the Private Office'),
    orgKey: text('post.ministry.private_office.org', 'Ministry of Territorial Administration'),
    orgShortKey: text('post.ministry.private_office.org_short', 'the private office'),
    baseSalary: 5400,
    effortPoints: 15,
    taskSlots: 5,
    monthsPerTurn: 4,
    headcount: 3,
    monthlyBudget: 9000,
    from: [
      { from: 'post.ministry.adviser', requires: REQ.toPrivateOffice },
      { from: 'post.region.head_of_unit', requires: REQ.toPrivateOffice, sideways: true },
    ],
  },
  {
    id: 'post.inspectorate.director',
    tier: 4,
    track: 'oversight',
    titleKey: text('post.inspectorate.director.title', 'Director of Inspection'),
    orgKey: text('post.inspectorate.director.org', 'Public Services Inspectorate'),
    orgShortKey: text('post.inspectorate.director.org_short', 'the Inspectorate'),
    baseSalary: 5100,
    effortPoints: 16,
    taskSlots: 6,
    monthsPerTurn: 6,
    headcount: 5,
    monthlyBudget: 15000,
    from: [
      { from: 'post.audit.senior_auditor', requires: REQ.toInspectorate },
      { from: 'post.region.head_of_unit', requires: REQ.toInspectorate, sideways: true },
    ],
  },

  /* --------------------------------------------------------------- tier 5 */

  {
    id: 'post.ministry.director_general',
    tier: 5,
    track: 'line',
    titleKey: text('post.ministry.director_general.title', 'Director-General'),
    orgKey: text('post.ministry.director_general.org', 'Ministry of Territorial Administration'),
    orgShortKey: text('post.ministry.director_general.org_short', 'the Ministry'),
    baseSalary: 6800,
    effortPoints: 18,
    taskSlots: 8,
    monthsPerTurn: 6,
    headcount: 8,
    monthlyBudget: 26000,
    from: [
      { from: 'post.agency.head_of_department', requires: REQ.toTier5 },
      { from: 'post.ministry.private_office', requires: REQ.toTier5, sideways: true },
      { from: 'post.inspectorate.director', requires: REQ.toTier5, sideways: true },
    ],
  },
  {
    id: 'post.ministry.chief_counsel',
    tier: 5,
    track: 'expert',
    titleKey: text('post.ministry.chief_counsel.title', 'Chief Adviser to the Government'),
    orgKey: text('post.ministry.chief_counsel.org', 'Office of the Council of Ministers'),
    orgShortKey: text('post.ministry.chief_counsel.org_short', 'the Council Office'),
    baseSalary: 6500,
    effortPoints: 29,
    taskSlots: 4,
    monthsPerTurn: 6,
    from: [
      { from: 'post.agency.chief_adviser', requires: REQ.toChiefCounsel },
      { from: 'post.agency.head_of_department', requires: REQ.toChiefCounsel, sideways: true },
    ],
  },
  {
    id: 'post.cabinet.special_adviser',
    tier: 5,
    track: 'political',
    titleKey: text('post.cabinet.special_adviser.title', 'Special Adviser to the Cabinet'),
    orgKey: text('post.cabinet.special_adviser.org', 'Office of the Council of Ministers'),
    orgShortKey: text('post.cabinet.special_adviser.org_short', 'the Cabinet Office'),
    baseSalary: 7000,
    effortPoints: 16,
    taskSlots: 6,
    monthsPerTurn: 4,
    headcount: 4,
    monthlyBudget: 14000,
    from: [
      { from: 'post.ministry.private_office', requires: REQ.toCabinet },
      { from: 'post.agency.head_of_department', requires: REQ.toCabinet, sideways: true },
    ],
  },
  {
    id: 'post.ombudsman.office',
    tier: 5,
    track: 'oversight',
    titleKey: text('post.ombudsman.office.title', 'Ombudsman'),
    orgKey: text('post.ombudsman.office.org', 'Office of the Ombudsman'),
    orgShortKey: text('post.ombudsman.office.org_short', 'the Ombudsman’s office'),
    baseSalary: 6600,
    effortPoints: 18,
    taskSlots: 7,
    monthsPerTurn: 6,
    headcount: 7,
    monthlyBudget: 22000,
    from: [
      { from: 'post.inspectorate.director', requires: REQ.toOmbudsman },
      { from: 'post.agency.head_of_department', requires: REQ.toOmbudsman, sideways: true },
    ],
  },
];
