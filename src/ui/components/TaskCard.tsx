import { registry } from '../../content';
import type { ActiveTask } from '../../engine/types';
import { useT } from '../../i18n';
import { EffortStepper } from './EffortStepper';

interface TaskCardProps {
  task: ActiveTask;
  turn: number;
  allocated: number;
  headroom: number;
  onChange: (points: number) => void;
}

export function TaskCard({ task, turn, allocated, headroom, onChange }: TaskCardProps) {
  const t = useT();
  const template = registry.tasks[task.templateId];
  const title = template ? t(template.titleKey) : task.templateId;

  const remaining = Math.max(0, task.required - task.progress);
  const monthsLeft = task.deadlineTurn - turn;
  const projected = Math.min(task.required, task.progress + allocated);
  const willFinish = task.progress + allocated >= task.required;

  const deadlineLabel =
    monthsLeft <= 0
      ? t('dash.due_now')
      : monthsLeft === 1
        ? t('dash.due_next')
        : t('dash.due_in', { turns: monthsLeft });

  const urgency = monthsLeft <= 0 ? 'now' : monthsLeft === 1 ? 'soon' : 'later';

  // Beyond what the task needs, extra care still improves quality — but only up to a point, so
  // the stepper stops where the bonus does rather than letting points vanish.
  const maxUseful = remaining + 4;

  return (
    <article className={`task${willFinish ? ' task--will-finish' : ''}`}>
      <div className="task__head">
        <h3 className="task__title">{title}</h3>
        <span className={`chip chip--${urgency}`}>{deadlineLabel}</span>
      </div>

      {template && <p className="task__desc">{t(template.descKey)}</p>}

      <div className="task__meta">
        <span className="task__difficulty" title={t('dash.difficulty')}>
          {'●'.repeat(task.difficulty)}
          <span className="task__difficulty-off">{'●'.repeat(3 - task.difficulty)}</span>
        </span>
        <span className="task__progress-text">
          {t('dash.progress', { progress: projected, required: task.required })}
        </span>
      </div>

      <div className="task__track">
        <div
          className="task__fill"
          style={{ width: `${(task.progress / task.required) * 100}%` }}
        />
        {allocated > 0 && (
          <div
            className="task__fill task__fill--planned"
            style={{
              left: `${(task.progress / task.required) * 100}%`,
              width: `${(Math.min(allocated, remaining) / task.required) * 100}%`,
            }}
          />
        )}
      </div>

      <div className="task__foot">
        <EffortStepper
          value={allocated}
          onChange={onChange}
          headroom={headroom}
          max={maxUseful}
          addLabel={t('dash.add_effort', { task: title })}
          removeLabel={t('dash.remove_effort', { task: title })}
        />
      </div>
    </article>
  );
}
