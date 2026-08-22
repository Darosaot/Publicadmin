import { MAX_TURNS } from '../../engine/constants';
import { STAT_IDS, type GameState } from '../../engine/types';
import { useT } from '../../i18n';
import { getPost } from '../../engine/registry';
import { registry } from '../../content';
import { climateBand } from '../../engine/climate';
import { savingsBand } from '../../engine/money';
import { formatDate, formatSalary } from '../format';
import { Meter } from './Meter';

export function StatsBar({ game }: { game: GameState }) {
  const t = useT();
  const post = getPost(registry, game.player.postId);
  const deltas = game.lastReport?.statDeltas ?? {};
  const band = savingsBand(game);

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
          {/*
            Savings are described rather than counted, the same rule the People and Country
            screens follow: a figure on the page invites optimising it, and what a player needs to
            know is "you could not afford that", which is what the choice itself will say.
          */}
          <span className={`statsbar__purse statsbar__purse--${band}`}>
            {t(`money.band.${band}`)}
          </span>
          <span className="statsbar__sep">·</span>
          <span className="muted">
            {t('dash.of_max', { turn: game.turn, max: MAX_TURNS })}
          </span>
        </p>
      </div>

      {/*
        The weather, always visible, because a signal you have to go and look for is not a signal.
        Two dials and the character of the government, described in a word each.
      */}
      {game.climate && (
        <div className="statsbar__climate" title={t('climate.help')}>
          {/*
            Its own class rather than a bare `eyebrow`: a second one of those inside `.statsbar`
            makes `.statsbar .eyebrow` match two elements, and the smoke test reads the date
            through exactly that selector. The markup was what became ambiguous, not the test.
          */}
          <p className="statsbar__stance">{t(`climate.stance.${game.climate.stance}`)}</p>
          <p className="statsbar__dials">
            <span className={`dial dial--${climateBand(game.climate.fiscal)}`}>
              {t('climate.fiscal')}: {t(`climate.band.${climateBand(game.climate.fiscal)}`)}
            </span>
            <span className={`dial dial--${climateBand(game.climate.trust)}`}>
              {/* Its own vocabulary: money is scarce or plentiful, belief is exhausted or firm. */}
              {t('climate.trust')}: {t(`climate.trust.band.${climateBand(game.climate.trust)}`)}
            </span>
          </p>
        </div>
      )}

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
