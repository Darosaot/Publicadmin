import { MAX_TURNS } from '../../engine/constants';
import { STAT_IDS, type GameState } from '../../engine/types';
import { useT } from '../../i18n';
import { getPost } from '../../engine/registry';
import { registry } from '../../content';
import { formatDate, formatSalary } from '../format';
import { Meter } from './Meter';

export function StatsBar({ game }: { game: GameState }) {
  const t = useT();
  const post = getPost(registry, game.player.postId);
  const deltas = game.lastReport?.statDeltas ?? {};

  return (
    <header className="statsbar">
      <div className="statsbar__identity">
        <p className="eyebrow">{formatDate(t, game)}</p>
        <h1 className="statsbar__name">{game.player.name}</h1>
        <p className="statsbar__post">
          {t(post.titleKey)} · {t(post.orgKey)}
        </p>
        <p className="statsbar__meta">
          <span className="statsbar__salary">{formatSalary(game.player.salary)}</span>
          <span className="muted"> / {t('stat.salary').toLowerCase()}</span>
          <span className="statsbar__sep">·</span>
          <span className="muted">
            {t('dash.of_max', { turn: game.turn, max: MAX_TURNS })}
          </span>
        </p>
      </div>

      <div className="statsbar__meters">
        {STAT_IDS.map((stat) => (
          <Meter
            key={stat}
            stat={stat}
            label={t(`stat.${stat}`)}
            title={t(`stat.${stat}.help`)}
            value={game.stats[stat]}
            delta={deltas[stat]}
          />
        ))}
      </div>
    </header>
  );
}
