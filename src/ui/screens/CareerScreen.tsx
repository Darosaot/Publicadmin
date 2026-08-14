import { careerLevels, registry } from '../../content';
import { meetsRequirements } from '../../engine/career';
import { getCareerLevel } from '../../engine/registry';
import type { GameState, PromotionRequirement } from '../../engine/types';
import { useT } from '../../i18n';
import { useGame } from '../../state/GameProvider';
import { formatSalary } from '../format';
import { GameTabs } from '../components/GameTabs';
import { StatsBar } from '../components/StatsBar';

export function CareerScreen({ game }: { game: GameState }) {
  const t = useT();
  const { dispatch } = useGame();

  const nextLevel = careerLevels.find((level) => level.level === game.player.level + 1);

  return (
    <>
      <StatsBar game={game} />

      <GameTabs current="career" />

      <div className="layout">
        <section className="layout__main">
          <h2 className="section__title">{t('career.offers_heading')}</h2>

          {game.offers.length === 0 ? (
            <p className="muted">{t('career.no_offers')}</p>
          ) : (
            <div className="offers">
              {game.offers.map((offer) => {
                const level = getCareerLevel(registry, offer.toLevel);
                const monthsLeft = offer.expiresTurn - game.turn;
                return (
                  <article key={offer.id} className="offer">
                    <h3 className="offer__title">
                      {t('career.offer_title', {
                        title: level.titleKey,
                        org: level.orgKey,
                      })}
                    </h3>
                    <p className="offer__salary">
                      {t('career.offer_salary', { salary: formatSalary(offer.salary) })}
                    </p>
                    <p className="offer__expiry">
                      {monthsLeft <= 0
                        ? t('career.offer_expires_now')
                        : t('career.offer_expires', { turns: monthsLeft })}
                    </p>
                    <div className="offer__actions">
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() => dispatch({ type: 'ACCEPT_OFFER', offerId: offer.id })}
                      >
                        {t('action.accept')}
                      </button>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => dispatch({ type: 'DECLINE_OFFER', offerId: offer.id })}
                      >
                        {t('action.decline')}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <h2 className="section__title">{t('career.ladder_heading')}</h2>
          <ol className="ladder">
            {careerLevels.map((level) => {
              const status =
                level.level < game.player.level
                  ? 'past'
                  : level.level === game.player.level
                    ? 'current'
                    : 'future';
              return (
                <li key={level.level} className={`rung rung--${status}`}>
                  <span className="rung__marker" aria-hidden="true" />
                  <div className="rung__body">
                    <h3 className="rung__title">{t(level.titleKey)}</h3>
                    <p className="rung__org">{t(level.orgKey)}</p>
                    <p className="rung__salary muted">{formatSalary(level.baseSalary)}</p>
                  </div>
                  <span className="rung__status eyebrow">
                    {status === 'past'
                      ? t('career.level_reached')
                      : status === 'current'
                        ? t('career.level_current')
                        : t('career.level_future')}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        <aside className="layout__side">
          <section className="panel">
            <h2 className="panel__title">{t('career.current')}</h2>
            <p className="career__post">
              {t(getCareerLevel(registry, game.player.level).titleKey)}
            </p>
            <p className="muted">{t(getCareerLevel(registry, game.player.level).orgKey)}</p>
            <p className="muted">
              {t('career.since', {
                months:
                  game.player.turnsAtLevel *
                  getCareerLevel(registry, game.player.level).monthsPerTurn,
              })}
            </p>
          </section>

          {nextLevel?.promotion ? (
            <section className="panel">
              <h2 className="panel__title">
                {t('career.requirements_heading', { title: nextLevel.titleKey })}
              </h2>
              <Requirements game={game} requirement={nextLevel.promotion} />
              {meetsRequirements(game, registry, nextLevel.level) && (
                <p className="requirements__ready">{t('career.qualified')}</p>
              )}
            </section>
          ) : (
            <section className="panel">
              <h2 className="panel__title">{t('career.ladder_heading')}</h2>
              <p className="muted">{t('career.top_of_ladder')}</p>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}

function Requirements({
  game,
  requirement,
}: {
  game: GameState;
  requirement: PromotionRequirement;
}) {
  const t = useT();

  const rows: { label: string; current: number; required: number; months?: boolean }[] = [
    {
      label: t('stat.reputation'),
      current: game.stats.reputation,
      required: requirement.minReputation,
    },
    {
      label: t('stat.performance'),
      current: game.stats.performance,
      required: requirement.minPerformance,
    },
  ];

  if (requirement.minPoliticalCapital !== undefined) {
    rows.push({
      label: t('stat.politicalCapital'),
      current: game.stats.politicalCapital,
      required: requirement.minPoliticalCapital,
    });
  }

  rows.push({
    label: t('career.requirement_time'),
    current: game.player.turnsAtLevel,
    required: requirement.minTurnsAtLevel,
    months: true,
  });

  return (
    <ul className="requirements">
      {rows.map((row) => {
        const met = row.current >= row.required;
        return (
          <li key={row.label} className={`requirement${met ? ' requirement--met' : ''}`}>
            <span>{row.label}</span>
            <span className="requirement__value">
              {met
                ? t('career.requirement_met')
                : row.months
                  ? t('career.requirement_months', {
                      current: row.current,
                      required: row.required,
                    })
                  : t('career.requirement_short', {
                      current: row.current,
                      required: row.required,
                    })}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
