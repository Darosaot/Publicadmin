import type { TaskTemplate } from '../../engine/types';
import { financeTasks } from './finance';
import { legalTasks } from './legal';
import { policyTasks } from './policy';
import { procurementTasks } from './procurement';
import { projectsTasks } from './projects';
import { sharedTasks } from './shared';

export const allTasks: TaskTemplate[] = [
  ...sharedTasks,
  ...legalTasks,
  ...projectsTasks,
  ...financeTasks,
  ...procurementTasks,
  ...policyTasks,
];

export const taskRegistry: Record<string, TaskTemplate> = Object.fromEntries(
  allTasks.map((task) => [task.id, task]),
);
