import type { CareerLevel } from '../engine/types';
import { text } from './authoring';

/**
 * The ladder, from a desk in a town of eighteen thousand to a directorate in the capital.
 *
 * Minister is not on this list. There is no sixth rung: at the top the ladder runs out and what
 * remains is politics, handled by the confirmation arc in `events/milestones.ts`.
 */
export const careerLevels: CareerLevel[] = [
  {
    level: 1,
    titleKey: text('career.1.title', 'Administrative Officer'),
    orgKey: text('career.1.org', 'Alderford City Council'),
    orgShortKey: text('career.1.org_short', 'Alderford'),
    baseSalary: 2100,
    effortPoints: 10,
    taskSlots: 4,
  },
  {
    level: 2,
    titleKey: text('career.2.title', 'Senior Officer'),
    orgKey: text('career.2.org', 'Northbridge City Council'),
    orgShortKey: text('career.2.org_short', 'Northbridge'),
    baseSalary: 2900,
    effortPoints: 12,
    taskSlots: 4,
    promotion: { minReputation: 35, minPerformance: 50, minTurnsAtLevel: 8 },
  },
  {
    level: 3,
    titleKey: text('career.3.title', 'Head of Unit'),
    orgKey: text('career.3.org', 'Regional Government of Valmara'),
    orgShortKey: text('career.3.org_short', 'the Region'),
    baseSalary: 3900,
    effortPoints: 14,
    taskSlots: 5,
    promotion: {
      minReputation: 50,
      minPerformance: 55,
      minPoliticalCapital: 25,
      minTurnsAtLevel: 10,
    },
  },
  {
    level: 4,
    titleKey: text('career.4.title', 'Head of Department'),
    orgKey: text('career.4.org', 'National Agency for Public Investment'),
    orgShortKey: text('career.4.org_short', 'the Agency'),
    baseSalary: 5200,
    effortPoints: 16,
    taskSlots: 5,
    promotion: {
      minReputation: 65,
      minPerformance: 60,
      minPoliticalCapital: 40,
      minTurnsAtLevel: 12,
    },
  },
  {
    level: 5,
    titleKey: text('career.5.title', 'Director-General'),
    orgKey: text('career.5.org', 'Ministry of Territorial Administration'),
    orgShortKey: text('career.5.org_short', 'the Ministry'),
    baseSalary: 6800,
    effortPoints: 18,
    taskSlots: 6,
    promotion: {
      minReputation: 78,
      minPerformance: 65,
      minPoliticalCapital: 55,
      minTurnsAtLevel: 12,
    },
  },
];
