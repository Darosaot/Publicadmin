import { registry } from '../../content';
import type { ActiveTask, StaffMember } from '../../engine/types';
import { useT } from '../../i18n';
import { negotiationCost, type NegotiationKind } from '../../engine/negotiate';
import { EffortStepper } from './EffortStepper';

interface TaskCardProps {
  task: ActiveTask;
  turn: number;
  allocated: number;
  headroom: number;
  onChange: (points: number) => void;
  /** Empty when the player has no unit; the control hides itself. */
  staff?: StaffMember[];
  assignedTo?: string;
  onDelegate?: (staffId: string | null) => void;
  /** Progress the assignee is expected to add this month, for the projection. */
  delegatedProgress?: number;
  /** The player's own political capital, for pricing the three ways of pushing back. */
  politicalCapital?: number;
  onNegotiate?: (kind: NegotiationKind) => void;
}

export function TaskCard({
  task,
  turn,
  allocated,
  headroom,
  onChange,
  staff = [],
  assignedTo,
  onDelegate,
  delegatedProgress = 0,
  politicalCapital = 0,
  onNegotiate,
}: TaskCardProps) {
  const t = useT();
  const template = registry.tasks[task.templateId];
  const title = template ? t(template.titleKey) : task.templateId;
  const crisis = template?.crisis === true;

  const remaining = Math.max(0, task.required - task.progress);
  const monthsLeft = task.deadlineTurn - turn;
  // What the file will be at month end counts the unit's contribution as well as your own.
  const incoming = allocated + delegatedProgress;
  const projected = Math.min(task.required, task.progress + incoming);
  const willFinish = task.progress + incoming >= task.required;

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
    <article
      className={`task${willFinish ? ' task--will-finish' : ''}${crisis ? ' task--crisis' : ''}`}
    >
      <div className="task__head">
        <h3 className="task__title">{title}</h3>
        <span className={`chip chip--${urgency}`}>{deadlineLabel}</span>
      </div>

      {crisis && <p className="task__crisis eyebrow">{t('task.crisis_label')}</p>}
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
        {incoming > 0 && (
          <div
            className="task__fill task__fill--planned"
            style={{
              left: `${(task.progress / task.required) * 100}%`,
              width: `${(Math.min(incoming, remaining) / task.required) * 100}%`,
            }}
          />
        )}
      </div>

      {/* The three things a real official does with a file they cannot deliver as specified,
          in ascending order of what it costs them. Priced in favours owed, because that is
          exactly what getting a date moved spends. */}
      {onNegotiate && (
        <div className="negotiate">
          {(['extend', 'scope', 'refuse'] as const).map((kind) => {
            const cost = negotiationCost(task, kind);
            // A crisis can be argued about, but not away: no declining and no cutting back.
            const barred = crisis && kind !== 'extend';
            const already =
              (kind === 'extend' && task.extended) || (kind === 'scope' && task.scoped);
            if (barred) return null;
            return (
              <button
                key={kind}
                type="button"
                className={`chipbtn negotiate__btn negotiate__btn--${kind}`}
                disabled={already || politicalCapital < cost}
                title={t(`negotiate.${kind}.help`)}
                onClick={() => onNegotiate(kind)}
              >
                {t(already ? `negotiate.${kind}.done` : `negotiate.${kind}`)}
                {!already && <span className="chipbtn__cost">{cost}</span>}
              </button>
            );
          })}
        </div>
      )}

      <div className="task__foot">
        {onDelegate && staff.length > 0 && (
          <label className="delegate">
            <span className="visually-hidden">{t('dash.delegate_to', { task: title })}</span>
            <select
              className="delegate__select"
              value={assignedTo ?? ''}
              onChange={(event) => onDelegate(event.target.value || null)}
            >
              <option value="">{t('dash.delegate_none')}</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
        )}
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
