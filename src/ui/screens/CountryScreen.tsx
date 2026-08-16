import { bodies } from '../../content';
import type { Body } from '../../content/bodies';
import type { GameState } from '../../engine/types';
import { bodyCondition, bodyKnown, bodyStanding } from '../../engine/world';
import { useT } from '../../i18n';
import { StatsBar } from '../components/StatsBar';
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

const CONDITION_BANDS = [
  { floor: 75, tone: 'strong' },
  { floor: 58, tone: 'sound' },
  { floor: 42, tone: 'strained' },
  { floor: 25, tone: 'failing' },
  { floor: 0, tone: 'collapsing' },
] as const;

function bandFor(condition: number): (typeof CONDITION_BANDS)[number]['tone'] {
  return (CONDITION_BANDS.find((band) => condition >= band.floor) ?? CONDITION_BANDS[4]).tone;
}

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
          <section className="panel">
            <h2 className="panel__title">{t('country.about_heading')}</h2>
            <p className="muted">{t('country.about')}</p>
          </section>

          {unseen > 0 && (
            <section className="panel">
              <h2 className="panel__title">{t('country.unseen_heading')}</h2>
              <p className="muted">{t('country.unseen', { count: unseen })}</p>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
