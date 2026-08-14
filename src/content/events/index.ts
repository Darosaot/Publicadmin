import type { GameEvent } from '../../engine/types';
import { commonEvents } from './common';
import { financeEvents } from './finance';
import { followupEvents } from './followups';
import { legalEvents } from './legal';
import { managementEvents } from './management';
import { milestoneEvents } from './milestones';
import { policyEvents } from './policy';
import { procurementEvents } from './procurement';
import { projectsEvents } from './projects';

export const allEvents: GameEvent[] = [
  ...commonEvents,
  ...legalEvents,
  ...projectsEvents,
  ...financeEvents,
  ...procurementEvents,
  ...policyEvents,
  ...managementEvents,
  ...milestoneEvents,
  ...followupEvents,
];

export const eventRegistry: Record<string, GameEvent> = Object.fromEntries(
  allEvents.map((event) => [event.id, event]),
);
