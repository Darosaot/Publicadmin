import { registry } from '../../content';
import {
  AGENCY_TEMP_COST,
  AGENCY_TEMP_EFFORT,
  AGENCY_TEMP_MAX,
  COACHING_EFFORT_COST,
  ONE_TO_ONE_EFFORT_COST,
  RECRUITING_EFFORT_COST,
  TRAINING_COST,
} from '../../engine/constants';
import { averageMorale, averageSkill, headcountFor, staffCost } from '../../engine/team';
import { discretionarySpend } from '../../engine/turn';
import { SENIORITIES, type GameState, type Seniority, type StaffMember } from '../../engine/types';
import { useT } from '../../i18n';
import { useGame } from '../../state/GameProvider';
import { Portrait } from '../components/Portrait';
import { StatsBar } from '../components/StatsBar';
import { GameTabs } from '../components/GameTabs';
import { formatSalary } from '../format';

/** The unit: who works for you, how they are, and what it all costs. */
export function TeamScreen({ game }: { game: GameState }) {
  const t = useT();
  const { state, dispatch, effortTotal, effortRemaining } = useGame();
  const { allocation } = state;

  const establishment = headcountFor(game, registry);
  const payroll = staffCost(game);
  const committed = discretionarySpend(allocation);
  const monthly = game.budget?.monthly ?? 0;
  const slack = monthly - payroll - committed;

  const assignments = new Map<string, string>();
  for (const [taskUid, staffId] of Object.entries(allocation.delegations)) {
    const task = game.tasks.find((tk) => tk.uid === taskUid);
    const template = task ? registry.tasks[task.templateId] : undefined;
    if (template) assignments.set(staffId, t(template.titleKey));
  }

  return (
    <>
      <StatsBar game={game} />
      <GameTabs current="team" />

      <div className="layout">
        <section className="layout__main">
          <h2 className="section__title">
            {t('team.roster_heading')}{' '}
            <span className="muted team__count">
              {t('team.of_establishment', { count: game.staff.length, max: establishment })}
            </span>
          </h2>

          {game.staff.length === 0 ? (
            <p className="muted">{t('team.empty')}</p>
          ) : (
            <div className="roster">
              {game.staff.map((member) => (
                <StaffCard
                  key={member.id}
                  member={member}
                  carrying={assignments.get(member.id)}
                  coaching={allocation.coaching.includes(member.id)}
                  meeting={allocation.oneToOnes.includes(member.id)}
                  training={allocation.training.includes(member.id)}
                  effortRemaining={effortRemaining}
                  budgetRemaining={slack}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="layout__side">
          {/* Nearly everything on this screen costs a point of the month, so the month has to be
              visible from here too, not only from the desk. */}
          <section className="panel effort">
            <h2 className="panel__title">{t('dash.personal_heading')}</h2>
            <p className="effort__count" data-testid="effort-remaining">
              {t('dash.effort_remaining', { remaining: effortRemaining, total: effortTotal })}
            </p>
            <div className="effort__track">
              <div
                className="effort__fill"
                style={{ width: `${effortTotal ? (effortRemaining / effortTotal) * 100 : 0}%` }}
              />
            </div>
          </section>

          <section className="panel">
            <h2 className="panel__title">{t('team.budget_heading')}</h2>

            <dl className="budget">
              <div className="budget__row">
                <dt>{t('team.budget_monthly')}</dt>
                <dd>{formatSalary(monthly)}</dd>
              </div>
              <div className="budget__row">
                <dt>{t('team.budget_payroll')}</dt>
                <dd>−{formatSalary(payroll)}</dd>
              </div>
              {committed > 0 && (
                <div className="budget__row">
                  <dt>{t('team.budget_committed')}</dt>
                  <dd>−{formatSalary(committed)}</dd>
                </div>
              )}
              <div className={`budget__row budget__row--total budget__row--${slack < 0 ? 'over' : 'under'}`}>
                <dt>{t('team.budget_slack')}</dt>
                <dd>{formatSalary(slack)}</dd>
              </div>
            </dl>

            <p className="budget__year">
              {t('team.budget_year', {
                balance: formatSalary(game.budget?.balance ?? 0),
              })}
            </p>
            <p className="muted budget__warning">{t('team.budget_warning')}</p>

            <div className="agency">
              <div>
                <h3 className="personal__name">{t('team.agency')}</h3>
                <p className="personal__desc">
                  {t('team.agency_desc', {
                    cost: formatSalary(AGENCY_TEMP_COST),
                    points: AGENCY_TEMP_EFFORT,
                  })}
                </p>
              </div>
              <div className="stepper">
                <button
                  type="button"
                  className="stepper__btn"
                  disabled={allocation.agencyTemps <= 0}
                  aria-label={t('team.agency_fewer')}
                  onClick={() =>
                    dispatch({ type: 'SET_AGENCY_TEMPS', count: allocation.agencyTemps - 1 })
                  }
                >
                  −
                </button>
                <span className="stepper__value">{allocation.agencyTemps}</span>
                <button
                  type="button"
                  className="stepper__btn"
                  disabled={allocation.agencyTemps >= AGENCY_TEMP_MAX}
                  aria-label={t('team.agency_more')}
                  onClick={() =>
                    dispatch({ type: 'SET_AGENCY_TEMPS', count: allocation.agencyTemps + 1 })
                  }
                >
                  +
                </button>
              </div>
            </div>
          </section>

          <section className="panel">
            <h2 className="panel__title">{t('team.hiring_heading')}</h2>

            {game.hiring ? (
              <>
                <p className="hiring__status">
                  {t('team.hiring_in_progress', {
                    grade: t(`team.grade.${game.hiring.seniority}`),
                    months: game.hiring.monthsRemaining,
                  })}
                </p>
                <label className="overtime">
                  <input
                    type="checkbox"
                    checked={allocation.recruiting}
                    onChange={() => dispatch({ type: 'TOGGLE_RECRUITING' })}
                  />
                  <span>
                    <strong>{t('team.hiring_work_on_it')}</strong>{' '}
                    <span className="muted">
                      {t('team.effort_cost', { points: RECRUITING_EFFORT_COST })}
                    </span>
                  </span>
                </label>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => dispatch({ type: 'CANCEL_HIRING' })}
                >
                  {t('team.hiring_abandon')}
                </button>
              </>
            ) : game.staff.length >= establishment ? (
              <p className="muted">{t('team.hiring_full')}</p>
            ) : (
              <>
                <p className="muted">{t('team.hiring_vacancy')}</p>
                <div className="hiring__grades">
                  {SENIORITIES.map((seniority) => (
                    <button
                      key={seniority}
                      type="button"
                      className="btn"
                      onClick={() => dispatch({ type: 'START_HIRING', seniority })}
                    >
                      {t(`team.grade.${seniority}`)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="panel">
            <h2 className="panel__title">{t('team.health_heading')}</h2>
            <p className="team__morale">
              {t('team.average_morale', { value: averageMorale(game) })}
            </p>
            <p className="team__average">
              {/* The other half of the picture: morale is what they will give you, skill is what
                  they have to give. Coaching moves this one and nothing showed it. */}
              {t('team.average_skill', { value: averageSkill(game) })}
            </p>
            <p className="muted">{t('team.morale_help')}</p>
          </section>
        </aside>
      </div>
    </>
  );
}

interface StaffCardProps {
  member: StaffMember;
  carrying?: string;
  coaching: boolean;
  meeting: boolean;
  training: boolean;
  effortRemaining: number;
  budgetRemaining: number;
}

function StaffCard({
  member,
  carrying,
  coaching,
  meeting,
  training,
  effortRemaining,
  budgetRemaining,
}: StaffCardProps) {
  const t = useT();
  const { dispatch } = useGame();

  const moraleTone = member.morale < 30 ? 'bad' : member.morale < 55 ? 'warn' : 'good';

  return (
    <article className={`staff staff--${moraleTone}`}>
      <div className="staff__head">
        <Portrait name={member.name} size={48} />
        <div className="staff__ident">
          <h3 className="staff__name">{member.name}</h3>
          <p className="staff__grade">
            {t(`team.grade.${member.seniority}`)} · {formatSalary(member.salary)}
          </p>
        </div>
        <span className="staff__months">
          {t('team.months_in_post', { months: member.monthsInPost })}
        </span>
      </div>

      <div className="staff__bars">
        <StaffBar label={t('team.skill')} value={member.skill} kind="skill" />
        <StaffBar label={t('team.morale')} value={member.morale} kind={moraleTone} />
      </div>

      {carrying && <p className="staff__carrying">{t('team.carrying', { task: carrying })}</p>}

      <div className="staff__actions">
        <button
          type="button"
          className={`chipbtn${meeting ? ' chipbtn--on' : ''}`}
          disabled={!meeting && effortRemaining < ONE_TO_ONE_EFFORT_COST}
          onClick={() => dispatch({ type: 'TOGGLE_ONE_TO_ONE', staffId: member.id })}
        >
          {t('team.one_to_one')} <span className="chipbtn__cost">{ONE_TO_ONE_EFFORT_COST}</span>
        </button>
        <button
          type="button"
          className={`chipbtn${coaching ? ' chipbtn--on' : ''}`}
          disabled={!coaching && effortRemaining < COACHING_EFFORT_COST}
          onClick={() => dispatch({ type: 'TOGGLE_COACHING', staffId: member.id })}
        >
          {t('team.coach')} <span className="chipbtn__cost">{COACHING_EFFORT_COST}</span>
        </button>
        <button
          type="button"
          className={`chipbtn${training ? ' chipbtn--on' : ''}`}
          disabled={!training && budgetRemaining < TRAINING_COST}
          onClick={() => dispatch({ type: 'TOGGLE_TRAINING', staffId: member.id })}
        >
          {t('team.train')} <span className="chipbtn__cost">{formatSalary(TRAINING_COST)}</span>
        </button>
      </div>
    </article>
  );
}

function StaffBar({ label, value, kind }: { label: string; value: number; kind: string }) {
  return (
    <div className="staffbar">
      <div className="staffbar__head">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="staffbar__track">
        <div className={`staffbar__fill staffbar__fill--${kind}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export type { Seniority };
