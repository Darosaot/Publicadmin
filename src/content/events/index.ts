import type { GameEvent } from '../../engine/types';
import { castEvents } from './cast';
import { commonEvents } from './common';
import { commonExtraEvents } from './common-extra';
import { departmentExtraEvents } from './departments-extra';
import { financeEvents } from './finance';
import { followupEvents } from './followups';
import { followupExtraEvents } from './followups-extra';
import { leadershipEvents } from './leadership';
import { legalEvents } from './legal';
import { managementEvents } from './management';
import { milestoneEvents } from './milestones';
import { policyEvents } from './policy';
import { procurementEvents } from './procurement';
import { reckoningEvents } from './reckonings';
import { trackEvents } from './tracks';
import { projectsEvents } from './projects';

export const allEvents: GameEvent[] = [
  ...commonEvents,
  ...castEvents,
  ...commonExtraEvents,
  ...legalEvents,
  ...projectsEvents,
  ...financeEvents,
  ...procurementEvents,
  ...policyEvents,
  ...departmentExtraEvents,
  ...managementEvents,
  ...leadershipEvents,
  ...milestoneEvents,
  ...followupEvents,
  ...followupExtraEvents,
  ...reckoningEvents,
  ...trackEvents,
];

export const eventRegistry: Record<string, GameEvent> = Object.fromEntries(
  allEvents.map((event) => [event.id, event]),
);
