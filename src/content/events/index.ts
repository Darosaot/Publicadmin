import type { GameEvent } from '../../engine/types';
import { alumniEvents } from './alumni';
import { crisisEvents } from './crises';
import { castEvents } from './cast';
import { climateEvents } from './climate';
import { commonEvents } from './common';
import { commonExtraEvents } from './common-extra';
import { departmentExtraEvents } from './departments-extra';
import { financeEvents } from './finance';
import { inspectionEvents } from './inspection';
import { followupEvents } from './followups';
import { followupExtraEvents } from './followups-extra';
import { leadershipEvents } from './leadership';
import { legalEvents } from './legal';
import { managementEvents } from './management';
import { milestoneEvents } from './milestones';
import { moneyEvents } from './money';
import { policyEvents } from './policy';
import { procurementEvents } from './procurement';
import { reckoningEvents } from './reckonings';
import { rivalEvents } from './rival';
import { socialEvents } from './social';
import { trackEvents } from './tracks';
import { projectsEvents } from './projects';

export const allEvents: GameEvent[] = [
  ...commonEvents,
  ...alumniEvents,
  ...crisisEvents,
  ...castEvents,
  ...commonExtraEvents,
  ...legalEvents,
  ...projectsEvents,
  ...financeEvents,
  ...procurementEvents,
  ...policyEvents,
  ...inspectionEvents,
  ...socialEvents,
  ...departmentExtraEvents,
  ...managementEvents,
  ...leadershipEvents,
  ...milestoneEvents,
  ...followupEvents,
  ...followupExtraEvents,
  ...reckoningEvents,
  ...trackEvents,
  ...rivalEvents,
  ...climateEvents,
  ...moneyEvents,
];

export const eventRegistry: Record<string, GameEvent> = Object.fromEntries(
  allEvents.map((event) => [event.id, event]),
);
