import { endingBodyKey, endingCopy, registry } from '../../content';
import { yearsElapsed } from '../../engine/calendar';
import { isPositiveEnding } from '../../engine/endings';
import { getPost } from '../../engine/registry';
import { STAT_IDS, type GameState } from '../../engine/types';
import { useT } from '../../i18n';
import { useGame } from '../../state/GameProvider';
import { formatSalary } from '../format';

export function EndingScreen({ game }: { game: GameState }) {
  const t = useT();
  const { dispatch } = useGame();

  const ending = game.ending;
  if (!ending) return null;

  const copy = endingCopy[ending];
  const post = getPost(registry, game.player.postId);
  const positive = isPositiveEnding(ending);

  return (
    <main className={`screen screen--ending ending--${positive ? 'good' : 'hard'}`}>
      <div className="ending">
        <p className="eyebrow">{t('ending.heading')}</p>
        <h1 className="ending__title">{t(copy.titleKey)}</h1>
        <p className="ending__epitaph">{t(copy.epitaphKey)}</p>

        <p className="ending__body">{t(endingBodyKey(ending, game))}</p>

        <section className="ending__panel">
          <h2 className="panel__title">{t('ending.stats_heading')}</h2>
          <dl className="ending__stats">
            {STAT_IDS.map((stat) => (
              <div key={stat} className="ending__stat">
                <dt>{t(`stat.${stat}`)}</dt>
                <dd>{game.stats[stat]}</dd>
              </div>
            ))}
            <div className="ending__stat">
              <dt>{t('stat.salary')}</dt>
              <dd>{formatSalary(game.player.salary)}</dd>
            </div>
          </dl>

          <p className="ending__summary">
            {t('ending.final_post')}: <strong>{t(post.titleKey)}</strong>, {t(post.orgKey)}
            <br />
            {t('ending.months', { years: yearsElapsed(game) })}
          </p>
        </section>

        <button
          type="button"
          className="btn btn--primary btn--lg"
          onClick={() => dispatch({ type: 'ABANDON' })}
        >
          {t('action.play_again')}
        </button>
      </div>
    </main>
  );
}
