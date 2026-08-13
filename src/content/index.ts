import type { ContentRegistry } from '../engine/registry';
import { careerLevels } from './careers';
import { departments } from './departments';
import { eventRegistry } from './events';
import { taskRegistry } from './tasks';

// Importing these for their side effect of registering strings, and for re-export.
import './endings';

export { departments, departmentList } from './departments';
export { careerLevels } from './careers';
export { endingCopy, endingBodyKey } from './endings';
export { allEvents, eventRegistry } from './events';
export { allTasks, taskRegistry } from './tasks';
export { EN_STRINGS } from './authoring';

export const registry: ContentRegistry = {
  departments,
  careerLevels,
  tasks: taskRegistry,
  events: eventRegistry,
};
