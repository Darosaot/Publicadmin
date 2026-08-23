import { bodies } from '../../content';
import type { Body } from '../../content/bodies';
import type { GameState } from '../../engine/types';
import { climateBand } from '../../engine/climate';
import { bodyCondition, bodyKnown, bodyStanding } from '../../engine/world';
import { useT } from '../../i18n';
import { StatsBar } from '../components/StatsBar';
import { ValmaraMap, bandFor } from '../components/ValmaraMap';
import { GameTabs } from '../components/GameTabs';

/**
 * The country you work in, and what is happening to it.
 *
 * Only shows places you have actually looked at. The rest are counted, not listed — the point of
 * the screen is that the country is bigger than your view of it, and a full list of institutions
 * you have never touched would say the opposite.
 *
 * Condition is a described band and a bar rather than a number, for the same reason standing is on
 * the People screen: a precise figure invites the player to farm it. What the player needs to know
 * is "this place is in trouble", not "this place is at 34".
 */


export function CountryScreen({ game }: { game: GameState }) {
  const t = useT();

  const seen = bodies
    .filter((body) => bodyKnown(game, body))
    .sort((a, b) => bodyCondition(game, a) - bodyCondition(game, b));

  const unseen = bodies.length - seen.length;

  return (
    <>
      <StatsBar game={game} />
      <GameTabs current="country" />

      <div className="layout">
        <section className="layout__main">
          <h2 className="section__title">{t('country.heading')}</h2>

          {/* Every institution, from the first month — the ones you have never looked at drawn
              without a name or a condition. The fog is the point: a list could tell you there
              were nine more places and could not show you that there was more country. */}
          <ValmaraMap game={game} />

          <h3 className="section__subtitle">{t('country.visited_heading')}</h3>

          {seen.length === 0 ? (
            <p className="muted">{t('country.empty')}</p>
          ) : (
            <div className="bodies">
              {seen.map((body: Body) => {
                const condition = bodyCondition(game, body);
                const drifted = condition - body.baselineCondition;
                const standing = bodyStanding(game, body);
                const tone = bandFor(condition);

                return (
                  <article key={body.id} className={`bodycard bodycard--${tone}`}>
                    <div className="bodycard__head">
                      <h3 className="bodycard__name">{body.name}</h3>
                      <span className="bodycard__state eyebrow">{t(`country.state.${tone}`)}</span>
                    </div>
                    <p className="bodycard__kind">{t(body.kindKey)}</p>

                    <div className="bodycard__track">
                      <div className="bodycard__fill" style={{ width: `${condition}%` }} />
                    </div>

                    <p className="bodycard__movement">
                      {drifted >= 2 && (
                        <span className="pill pill--good">{t('country.better')}</span>
                      )}
                      {drifted <= -2 && (
                        <span className="pill pill--bad">{t('country.worse')}</span>
                      )}
                      {standing >= 15 && (
                        <span className="pill pill--good">{t('country.owes_you')}</span>
                      )}
                      {standing <= -15 && (
                        <span className="pill pill--bad">{t('country.resents_you')}</span>
                      )}
                    </p>

                    <p className="bodycard__blurb muted">{t(body.blurbKey)}</p>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="layout__side">
          {/*
            The weather sits on the screen it drives. Austerity accelerates every falling body
            below, and low trust drags what these institutions think of you — so the detail
            belongs here rather than on a screen of its own, next to what it is doing.
          */}
          {game.climate && (
            <section className="panel">
              <h2 className="panel__title">{t('climate.heading')}</h2>
              <p className="statsbar__stance">
                {t(`climate.stance.${game.climate.stance}`)} ·{' '}
                {t('climate.administration', { n: game.climate.administration })}
              </p>
              <dl className="climate">
                <dt>{t('climate.fiscal')}</dt>
                <dd className={`dial dial--${climateBand(game.climate.fiscal)}`}>
                  {t(`climate.band.${climateBand(game.climate.fiscal)}`)}
                </dd>
                <dt>{t('climate.trust')}</dt>
                <dd className={`dial dial--${climateBand(game.climate.trust)}`}>
                  {t(`climate.trust.band.${climateBand(game.climate.trust)}`)}
                </dd>
              </dl>
              <p className="muted">
                {game.climate.monthsToElection <= 12
                  ? t('climate.election_near')
                  : t('climate.election_far')}
              </p>
              <p className="muted">{t('climate.about')}</p>
            </section>
          )}

          <section className="panel">
            <h2 className="panel__title">{t('country.about_heading')}</h2>
            <p className="muted">{t('country.about')}</p>
          </section>

          {unseen > 0 && (
            <section className="panel">
              <h2 className="panel__title">{t('country.unseen_heading')}</h2>
              {/* Kept alongside the map rather than replaced by it: the map shows you *that*
                  there is more, and this says how much, which is the one thing a blank dot
                  cannot. */}
              <p className="muted">{t('country.unseen', { count: unseen })}</p>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
