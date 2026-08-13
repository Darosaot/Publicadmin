import { NETWORK_PC_GAIN, OVERTIME_POINTS, OVERTIME_STRESS, REST_STRESS_RELIEF } from '../../engine/constants';
import type { GameState } from '../../engine/types';
import { useT } from '../../i18n';
import { useGame } from '../../state/GameProvider';
import { EffortStepper } from '../components/EffortStepper';
import { LogPanel } from '../components/LogPanel';
import { StatsBar } from '../components/StatsBar';
import { TaskCard } from '../components/TaskCard';

/** The desk: the month's work, what you plan to do about it, and what it will cost you. */
export function DashboardScreen({ game }: { game: GameState }) {
  const t = useT();
  const { state, dispatch, effortTotal, effortSpent, effortRemaining } = useGame();
  const { allocation } = state;

  const hasOffers = game.offers.length > 0;

  return (
    <>
      <StatsBar game={game} />

      <nav className="tabs">
        <button type="button" className="tab tab--active" aria-current="page">
          {t('action.dashboard')}
        </button>
        <button
          type="button"
          className="tab"
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'career' })}
        >
          {t('action.career')}
          {hasOffers && <span className="tab__dot" aria-hidden="true" />}
        </button>
      </nav>

      {hasOffers && (
        <p className="banner" role="status">
          {t('dash.offer_waiting')}{' '}
          <button
            type="button"
            className="banner__link"
            onClick={() => dispatch({ type: 'SET_VIEW', view: 'career' })}
          >
            {t('action.career')}
          </button>
        </p>
      )}

      <div className="layout">
        <section className="layout__main">
          <h2 className="section__title">{t('dash.board_heading')}</h2>

          {game.tasks.length === 0 ? (
            <p className="muted">{t('dash.empty_board')}</p>
          ) : (
            <div className="board">
              {game.tasks.map((task) => (
                <TaskCard
                  key={task.uid}
                  task={task}
                  turn={game.turn}
                  allocated={allocation.tasks[task.uid] ?? 0}
                  headroom={effortRemaining}
                  onChange={(points) =>
                    dispatch({ type: 'SET_TASK_EFFORT', uid: task.uid, points })
                  }
                />
              ))}
            </div>
          )}
        </section>

        <aside className="layout__side">
          <section className="panel effort">
            <h2 className="panel__title">{t('dash.personal_heading')}</h2>

            <p className="effort__count" data-testid="effort-remaining">
              {t('dash.effort_remaining', { remaining: effortRemaining, total: effortTotal })}
            </p>
            <div className="effort__track">
              <div
                className="effort__fill"
                style={{ width: `${effortTotal ? (effortSpent / effortTotal) * 100 : 0}%` }}
              />
            </div>

            <div className="personal">
              <div className="personal__row">
                <div>
                  <h3 className="personal__name">{t('dash.rest')}</h3>
                  <p className="personal__desc">
                    {t('dash.rest_desc', { amount: REST_STRESS_RELIEF })}
                  </p>
                </div>
                <EffortStepper
                  value={allocation.rest}
                  onChange={(points) => dispatch({ type: 'SET_REST', points })}
                  headroom={effortRemaining}
                  addLabel={t('dash.add_effort', { task: t('dash.rest') })}
                  removeLabel={t('dash.remove_effort', { task: t('dash.rest') })}
                />
              </div>

              <div className="personal__row">
                <div>
                  <h3 className="personal__name">{t('dash.networking')}</h3>
                  <p className="personal__desc">
                    {t('dash.networking_desc', { amount: NETWORK_PC_GAIN })}
                  </p>
                </div>
                <EffortStepper
                  value={allocation.networking}
                  onChange={(points) => dispatch({ type: 'SET_NETWORKING', points })}
                  headroom={effortRemaining}
                  addLabel={t('dash.add_effort', { task: t('dash.networking') })}
                  removeLabel={t('dash.remove_effort', { task: t('dash.networking') })}
                />
              </div>
            </div>

            <label className="overtime">
              <input
                type="checkbox"
                checked={allocation.overtime}
                onChange={() => dispatch({ type: 'TOGGLE_OVERTIME' })}
              />
              <span>
                <strong>{t('dash.overtime')}</strong>
                <span className="muted">
                  {' '}
                  {t('dash.overtime_hint', {
                    points: OVERTIME_POINTS,
                    stress: OVERTIME_STRESS,
                  })}
                </span>
              </span>
            </label>

            <button
              type="button"
              className="btn btn--primary btn--lg effort__end"
              onClick={() => dispatch({ type: 'END_TURN' })}
            >
              {t('action.end_turn')}
            </button>
          </section>

          <LogPanel log={game.log} />
        </aside>
      </div>
    </>
  );
}
