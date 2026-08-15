import { directives } from '../../content';
import { stanceOf } from '../../engine/directives';
import type { GameState } from '../../engine/types';
import { useT } from '../../i18n';
import { useGame } from '../../state/GameProvider';

/**
 * How you run an office, as opposed to what you do this month.
 *
 * Lives on the desk beside the month's allocation, because that is where the player is thinking
 * about how a month gets spent — but it is deliberately not part of the allocation. These hold
 * until they are changed, and clicking a pole you already hold turns it off again rather than
 * doing nothing, so "we have not decided" stays reachable.
 *
 * Each pole states its cost as flatly as its benefit. There is no correct answer here and the
 * screen must not imply there is one.
 */
export function DirectivePanel({ game }: { game: GameState }) {
  const t = useT();
  const { dispatch } = useGame();

  return (
    <section className="panel">
      <h2 className="panel__title">{t('directive.heading')}</h2>
      <p className="muted directive__intro">{t('directive.intro')}</p>

      <div className="directives">
        {directives.map((directive) => {
          const current = stanceOf(game, directive.id);

          return (
            <div key={directive.id} className="directive">
              <h3 className="directive__name">{t(directive.nameKey)}</h3>
              <p className="directive__blurb muted">{t(directive.blurbKey)}</p>

              <div className="directive__poles">
                {directive.poles.map((pole) => {
                  const active = current === pole.stance;
                  return (
                    <button
                      key={pole.stance}
                      type="button"
                      className={`directive__pole${active ? ' directive__pole--active' : ''}`}
                      aria-pressed={active}
                      onClick={() =>
                        dispatch({
                          type: 'SET_DIRECTIVE',
                          directiveId: directive.id,
                          // Pressing the pole you already hold releases it — an office that has
                          // not decided is a real answer and has to stay reachable.
                          stance: active ? 0 : pole.stance,
                        })
                      }
                    >
                      <span className="directive__label">{t(pole.labelKey)}</span>
                      <span className="directive__effect">{t(pole.effectKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
