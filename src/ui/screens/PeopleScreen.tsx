import { cast } from '../../content';
import { flagValue } from '../../engine/effects';
import type { GameState } from '../../engine/types';
import { useT } from '../../i18n';
import { StatsBar } from '../components/StatsBar';
import { GameTabs } from '../components/GameTabs';

/**
 * Who you know, and how you stand with them.
 *
 * Deliberately closer to a contacts list than a stat screen. The number behind each of these is a
 * flag the engine never shows anywhere else, and putting a precise score on the page would invite
 * the player to optimise a relationship rather than have one — so it is a described state and a
 * bar, not a figure.
 */
export function PeopleScreen({ game }: { game: GameState }) {
  const t = useT();

  const known = cast.filter((person) => game.flags[person.metFlag]);

  return (
    <>
      <StatsBar game={game} />
      <GameTabs current="people" />

      <div className="layout">
        <section className="layout__main">
          <h2 className="section__title">{t('people.heading')}</h2>

          {known.length === 0 ? (
            <p className="muted">{t('people.empty')}</p>
          ) : (
            <div className="people">
              {known.map((person) => {
                const standing = flagValue(game, person.flag);
                const tone =
                  standing >= 25
                    ? 'warm'
                    : standing >= 8
                      ? 'good'
                      : standing <= -25
                        ? 'cold'
                        : standing <= -8
                          ? 'wary'
                          : 'neutral';

                // Clamped to a readable range: standing has no ceiling, and a bar that keeps
                // creeping rightward for thirty years stops meaning anything.
                const width = Math.min(100, Math.max(0, 50 + standing * 1.25));

                return (
                  <article key={person.id} className={`person person--${tone}`}>
                    <div className="person__head">
                      <h3 className="person__name">{person.name}</h3>
                      <span className="person__tone eyebrow">{t(`people.tone.${tone}`)}</span>
                    </div>
                    <p className="person__role">{t(person.roleKey)}</p>
                    <div className="person__track">
                      <div className="person__fill" style={{ width: `${width}%` }} />
                      <span className="person__mid" aria-hidden="true" />
                    </div>
                    <p className="person__blurb muted">{t(person.blurbKey)}</p>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="layout__side">
          <section className="panel">
            <h2 className="panel__title">{t('people.about_heading')}</h2>
            <p className="muted">{t('people.about')}</p>
          </section>

          {known.length < cast.length && (
            <section className="panel">
              <h2 className="panel__title">{t('people.unmet_heading')}</h2>
              <p className="muted">
                {t('people.unmet', { count: cast.length - known.length })}
              </p>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
