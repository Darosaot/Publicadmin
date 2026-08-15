/**
 * The Spanish narrative dictionary, assembled the same way `EN_STRINGS` is: one file per source
 * content module, merged here into a single flat map keyed identically to the English original.
 *
 * A key collision between two files with different text is almost certainly a copy-paste mistake
 * — the same failure mode `authoring.ts`'s `register` guards against on the English side — so it
 * throws at import time rather than silently taking whichever file loaded last.
 */

import { strings as bodies } from './bodies';
import { strings as careers } from './careers';
import { strings as castPeople } from './cast';
import { strings as departments } from './departments';
import { strings as endings } from './endings';
import { strings as eventsCast } from './events/cast';
import { strings as eventsCommon } from './events/common';
import { strings as eventsCommonExtra } from './events/common-extra';
import { strings as eventsDepartmentsExtra } from './events/departments-extra';
import { strings as eventsFinance } from './events/finance';
import { strings as eventsFollowups } from './events/followups';
import { strings as eventsFollowupsExtra } from './events/followups-extra';
import { strings as eventsInspection } from './events/inspection';
import { strings as eventsLeadership } from './events/leadership';
import { strings as eventsLegal } from './events/legal';
import { strings as eventsManagement } from './events/management';
import { strings as eventsMilestones } from './events/milestones';
import { strings as eventsPolicy } from './events/policy';
import { strings as eventsProcurement } from './events/procurement';
import { strings as eventsProjects } from './events/projects';
import { strings as eventsReckonings } from './events/reckonings';
import { strings as eventsSocial } from './events/social';
import { strings as eventsTracks } from './events/tracks';
import { strings as initiatives } from './initiatives';
import { strings as tasksFinance } from './tasks/finance';
import { strings as tasksInspection } from './tasks/inspection';
import { strings as tasksLegal } from './tasks/legal';
import { strings as tasksPolicy } from './tasks/policy';
import { strings as tasksProcurement } from './tasks/procurement';
import { strings as tasksProjects } from './tasks/projects';
import { strings as tasksSenior } from './tasks/senior';
import { strings as tasksShared } from './tasks/shared';
import { strings as tasksSocial } from './tasks/social';

const dictionaries = [
  bodies,
  careers,
  castPeople,
  departments,
  endings,
  eventsCast,
  eventsCommon,
  eventsCommonExtra,
  eventsDepartmentsExtra,
  eventsFinance,
  eventsFollowups,
  eventsFollowupsExtra,
  eventsInspection,
  eventsLeadership,
  eventsLegal,
  eventsManagement,
  eventsMilestones,
  eventsPolicy,
  eventsProcurement,
  eventsProjects,
  eventsReckonings,
  eventsSocial,
  eventsTracks,
  initiatives,
  tasksFinance,
  tasksInspection,
  tasksLegal,
  tasksPolicy,
  tasksProcurement,
  tasksProjects,
  tasksSenior,
  tasksShared,
  tasksSocial,
];

export const ES_STRINGS: Record<string, string> = {};

for (const dictionary of dictionaries) {
  for (const [key, value] of Object.entries(dictionary)) {
    if (ES_STRINGS[key] !== undefined && ES_STRINGS[key] !== value) {
      throw new Error(`Duplicate Spanish content key with different text: ${key}`);
    }
    ES_STRINGS[key] = value;
  }
}
