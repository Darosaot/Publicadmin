import type { ContentRegistry } from '../engine/registry';
import { bodies } from './bodies';
import { posts } from './careers';
import { departments } from './departments';

// Imported for the side effect of registering the directives' strings, and for re-export.
import './directives';

// Imported for the side effect of registering the cast's strings, and for re-export.
import './cast';
import { eventRegistry } from './events';
import { initiatives } from './initiatives';
import { perks } from './perks';
import { staffNames } from './staff';
import { taskRegistry } from './tasks';

// Importing these for their side effect of registering strings, and for re-export.
import './endings';

export { departments, departmentList } from './departments';
export { posts } from './careers';
export { cast } from './cast';
export { bodies, bodyRegistry } from './bodies';
export { directives } from './directives';
export { initiatives, initiativeRegistry } from './initiatives';
export { endingCopy, endingBodyKey } from './endings';
export { allEvents, eventRegistry } from './events';
export { allTasks, taskRegistry } from './tasks';
export { perks } from './perks';
export { staffNames } from './staff';
export { EN_STRINGS } from './authoring';

export const registry: ContentRegistry = {
  departments,
  posts,
  tasks: taskRegistry,
  events: eventRegistry,
  perks,
  staffNames,
  bodies,
  initiatives,
};
