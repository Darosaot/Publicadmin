import { registry } from '../../content';
import { INITIATIVE_LAPSE_CYCLES } from '../../engine/constants';
import {
  cycleCap,
  initiativeSlots,
  startableInitiatives,
} from '../../engine/initiatives';
import { staffOutput } from '../../engine/team';
import type { GameState } from '../../engine/types';
import { useT } from '../../i18n';
import { useGame } from '../../state/GameProvider';
import { EffortStepper } from '../components/EffortStepper';
import { GameTabs } from '../components/GameTabs';
import { StatsBar } from '../components/StatsBar';

/**
 * Things you decided to do.
 *
 * The board is on the desk because it arrived; this is on its own screen because it did not. The
 * separation is the point of the feature — everywhere else in the game the player is answering,
 * and here they are asking.
 *
 * Effort spent here comes out of the same monthly budget as the files, and the counter says so,
 * because the entire decision is what a month is worth spending on.
 */
export function InitiativesScreen({ game }: { game: GameState }) {
  const t = useT();
  const { state, dispatch, effortTotal, effortSpent, effortRemaining } = useGame();
  const { allocation } = state;

  const open = startableInitiatives(game, registry);
  const slots = initiativeSlots(game);
  const free = slots - game.initiatives.length;

  return (
    <>
      <StatsBar game={game} />
      <GameTabs current="initiatives" />

      <div className="layout">
        <section className="layout__main">
          <h2 className="section__title">{t('init.live_heading')}</h2>

          {game.initiatives.length === 0 ? (
            <p className="muted">{t('init.none_live')}</p>
          ) : (
            <div className="board">
              {game.initiatives.map((live) => {
                const template = registry.initiatives.find((x) => x.id === live.templateId);
                if (!template) return null;

                const carrierId = allocation.initiativeDelegations[live.templateId];
                const carrier = game.staff.find((s) => s.id === carrierId);
                const cap = cycleCap(template);

                const own = allocation.initiativeEffort[live.templateId] ?? 0;
                const delegated = carrier ? staffOutput(carrier) : 0;
                const incoming = Math.min(own + delegated, cap);
                const projected = Math.min(live.required, live.progress + incoming);
                const willFinish = live.progress + incoming >= live.required;

                // Counting down rather than up: what the player needs to know is how long they
                // have to remember this, not how many cycles they have already spent.
                const idleLeft = INITIATIVE_LAPSE_CYCLES - live.idleCycles;

                return (
                  <article
                    key={live.templateId}
                    className={`initiative${willFinish ? ' initiative--landing' : ''}`}
                  >
                    <h3 className="initiative__name">{t(template.titleKey)}</h3>
                    <p className="initiative__desc">{t(template.descKey)}</p>

                    <div className="initiative__track">
                      <div
                        className="initiative__fill"
                        style={{ width: `${(live.progress / live.required) * 100}%` }}
                      />
                      <div
                        className="initiative__projection"
                        style={{ width: `${(projected / live.required) * 100}%` }}
                      />
                    </div>

                    <p className="initiative__meta">
                      <span>
                        {t('dash.progress', {
                          progress: live.progress,
                          required: live.required,
                        })}
                      </span>
                      <span className="muted">{t('init.cap', { points: cap })}</span>
                      {live.idleCycles > 0 && (
                        <span className="pill pill--bad">
                          {t('init.slipping', { cycles: idleLeft })}
                        </span>
                      )}
                      {willFinish && <span className="pill pill--good">{t('init.lands')}</span>}
                    </p>

                    <div className="initiative__foot">
                      {game.staff.length > 0 && (
                        <label className="delegate">
                          <span className="visually-hidden">
                            {t('init.delegate_to', { initiative: t(template.titleKey) })}
                          </span>
                          <select
                            className="delegate__select"
                            value={carrierId ?? ''}
                            onChange={(event) =>
                              dispatch({
                                type: 'SET_INITIATIVE_DELEGATION',
                                templateId: live.templateId,
                                staffId: event.target.value || null,
                              })
                            }
                          >
                            <option value="">{t('dash.delegate_none')}</option>
                            {game.staff.map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      <EffortStepper
                        value={own}
                        onChange={(points) =>
                          dispatch({
                            type: 'SET_INITIATIVE_EFFORT',
                            templateId: live.templateId,
                            points,
                          })
                        }
                        headroom={effortRemaining}
                        max={cap}
                        addLabel={t('dash.add_effort', { task: t(template.titleKey) })}
                        removeLabel={t('dash.remove_effort', { task: t(template.titleKey) })}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <h2 className="section__title">{t('init.menu_heading')}</h2>

          {open.length === 0 ? (
            <p className="muted">{free > 0 ? t('init.menu_empty') : t('init.menu_full')}</p>
          ) : (
            <div className="board">
              {open.map((template) => (
                <article key={template.id} className="initiative initiative--offered">
                  <h3 className="initiative__name">{t(template.titleKey)}</h3>
                  <p className="initiative__desc">{t(template.descKey)}</p>
                  <p className="initiative__meta muted">
                    {t('init.commitment', {
                      points: template.required,
                      cycles: template.minCycles,
                    })}
                  </p>
                  <div className="initiative__foot">
                    <button
                      type="button"
                      className="btn btn--small"
                      onClick={() =>
                        dispatch({ type: 'START_INITIATIVE', templateId: template.id })
                      }
                    >
                      {t('init.start')}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="layout__side">
          <section className="panel effort">
            <h2 className="panel__title">{t('init.budget_heading')}</h2>

            <p className="effort__count" data-testid="effort-remaining">
              {t('dash.effort_remaining', { remaining: effortRemaining, total: effortTotal })}
            </p>
            <div className="effort__track">
              <div
                className="effort__fill"
                style={{ width: `${effortTotal ? (effortSpent / effortTotal) * 100 : 0}%` }}
              />
            </div>
            <p className="muted">{t('init.budget_note')}</p>
          </section>

          <section className="panel">
            <h2 className="panel__title">{t('init.about_heading')}</h2>
            <p className="muted">{t('init.about')}</p>
            <p className="muted">
              {t('init.slots', { used: game.initiatives.length, total: slots })}
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
