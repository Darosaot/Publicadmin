import { bodies, registry } from '../../content';
import { doneFlag } from '../../engine/initiatives';
import { bodyCondition, bodyKnown, contributionTo } from '../../engine/world';
import type { GameState } from '../../engine/types';
import { useT } from '../../i18n';
import { Portrait } from './Portrait';

/**
 * What is left behind.
 *
 * The stats panel above this says what the career was worth to the player. This says what it was
 * worth to anybody else, which is the question the whole game is about and which nothing else on
 * any screen answers.
 *
 * Only places the player actually touched appear. A list of institutions that drifted on their own
 * while you were busy elsewhere is not an epilogue, it is a weather report — so a body qualifies
 * only if the player finished something aimed at it.
 */

export function Epilogue({ game }: { game: GameState }) {
  const t = useT();

  // Only places the player actually worked on. A body that drifted while they were busy elsewhere
  // is not part of anybody's record.
  const touched = bodies
    .filter((body) => bodyKnown(game, body))
    .map((body) => ({
      body,
      contributed: contributionTo(game, registry, body.id),
      net: bodyCondition(game, body) - body.baselineCondition,
    }))
    .filter(({ contributed }) => contributed !== 0)
    .sort((a, b) => b.contributed - a.contributed);

  const finished = registry.initiatives.filter((template) => game.flags[doneFlag(template.id)]);

  // Not the whole roster: the two who thought most of you, and the one who thought least. A list
  // of twelve names is a database dump, and three is a memory.
  const byRegard = [...game.alumni].sort((a, b) => b.regard - a.regard);
  const remembered = [
    ...byRegard.slice(0, 2),
    ...(byRegard.length > 2 ? [byRegard[byRegard.length - 1]!] : []),
  ];

  if (touched.length === 0 && finished.length === 0 && remembered.length === 0) {
    return (
      <section className="ending__panel">
        <h2 className="panel__title">{t('epilogue.heading')}</h2>
        <p className="muted">{t('epilogue.nothing')}</p>
      </section>
    );
  }

  return (
    <section className="ending__panel epilogue">
      <h2 className="panel__title">{t('epilogue.heading')}</h2>

      {finished.length > 0 && (
        <div className="epilogue__block">
          <h3 className="epilogue__title">{t('epilogue.finished_heading')}</h3>
          <ul className="epilogue__list">
            {finished.map((template) => (
              <li key={template.id}>{t(template.titleKey)}</li>
            ))}
          </ul>
        </div>
      )}

      {touched.length > 0 && (
        <div className="epilogue__block epilogue__block--country">
          <h3 className="epilogue__title">{t('epilogue.country_heading')}</h3>
          <ul className="epilogue__list">
            {touched.map(({ body, contributed, net }) => (
              <li key={body.id}>
                <span className="epilogue__name">{body.name}</span>{' '}
                {/*
                  Three outcomes, and the middle one is the honest and most common: the work
                  landed and the place still ended lower than it started, because thirty years of
                  neglect outruns one person. Reporting that as failure would be a lie in the
                  other direction — it fell less far than it would have.
                */}
                {contributed < 0 ? (
                  <span className="epilogue__down">{t('epilogue.left_worse')}</span>
                ) : net >= 0 ? (
                  <span className="epilogue__up">{t('epilogue.left_better')}</span>
                ) : (
                  <span className="epilogue__slowed">
                    {t('epilogue.slowed', { points: contributed })}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {remembered.length > 0 && (
        <div className="epilogue__block">
          <h3 className="epilogue__title">{t('epilogue.people_heading')}</h3>
          <ul className="epilogue__list">
            {remembered.map((person) => (
              <li key={`${person.name}-${person.leftOnTurn}`}>
                <Portrait name={person.name} size={32} />{' '}
                <span className="epilogue__name">{person.name}</span>{' '}
                <span className="muted">
                  {person.regard >= 15
                    ? t('epilogue.regard_warm')
                    : person.regard <= -15
                      ? t('epilogue.regard_cold')
                      : t('epilogue.regard_neutral')}
                </span>
                {/*
                  Where they ended up, when they were poached rather than resigning. This is the
                  whole reason `nowAt` exists, and it went unread for two releases.
                */}
                {person.nowAt && (
                  <span className="muted">
                    {' '}
                    {t('epilogue.now_at', {
                      body: bodies.find((b) => b.id === person.nowAt)?.name ?? person.nowAt,
                    })}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
