import { bodies, registry } from '../../content';
import { doneFlag } from '../../engine/initiatives';
import { bodyCondition, bodyKnown } from '../../engine/world';
import type { GameState } from '../../engine/types';
import { useT } from '../../i18n';

/**
 * What is left behind.
 *
 * The stats panel above this says what the career was worth to the player. This says what it was
 * worth to anybody else, which is the question the whole game is about and which nothing else on
 * any screen answers.
 *
 * Only places the player actually touched appear. A list of institutions that drifted on their own
 * while you were busy elsewhere is not an epilogue, it is a weather report — so a body qualifies
 * only if it moved by more than its own drift could explain, or if the player finished something
 * aimed at it.
 */

/** Movement smaller than this is drift, and drift is not an achievement. */
const MEANINGFUL = 5;

export function Epilogue({ game }: { game: GameState }) {
  const t = useT();

  const touched = bodies
    .filter((body) => bodyKnown(game, body))
    .map((body) => ({ body, moved: bodyCondition(game, body) - body.baselineCondition }))
    .filter(({ moved }) => Math.abs(moved) >= MEANINGFUL)
    .sort((a, b) => b.moved - a.moved);

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
        <div className="epilogue__block">
          <h3 className="epilogue__title">{t('epilogue.country_heading')}</h3>
          <ul className="epilogue__list">
            {touched.map(({ body, moved }) => (
              <li key={body.id}>
                <span className="epilogue__name">{body.name}</span>{' '}
                <span className={moved > 0 ? 'epilogue__up' : 'epilogue__down'}>
                  {moved > 0 ? t('epilogue.left_better') : t('epilogue.left_worse')}
                </span>
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
                <span className="epilogue__name">{person.name}</span>{' '}
                <span className="muted">
                  {person.regard >= 15
                    ? t('epilogue.regard_warm')
                    : person.regard <= -15
                      ? t('epilogue.regard_cold')
                      : t('epilogue.regard_neutral')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
