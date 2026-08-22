import type { TaskTemplate } from '../../engine/types';
import { financeTasks } from './finance';
import { inspectionTasks } from './inspection';
import { crisisTasks } from './crises';
import { legalTasks } from './legal';
import { policyTasks } from './policy';
import { procurementTasks } from './procurement';
import { seniorTasks } from './senior';
import { projectsTasks } from './projects';
import { sharedTasks } from './shared';
import { socialTasks } from './social';

export const allTasks: TaskTemplate[] = [
  ...sharedTasks,
  ...crisisTasks,
  ...legalTasks,
  ...projectsTasks,
  ...financeTasks,
  ...procurementTasks,
  ...policyTasks,
  ...inspectionTasks,
  ...socialTasks,
  ...seniorTasks,
];

export const taskRegistry: Record<string, TaskTemplate> = Object.fromEntries(
  allTasks.map((task) => [task.id, task]),
);
