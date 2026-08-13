import { useState } from 'react';
import { useT } from '../../i18n';
import { saveExists, useGame } from '../../state/GameProvider';

export function TitleScreen({ onNewGame }: { onNewGame: () => void }) {
  const t = useT();
  const { state, dispatch } = useGame();
  // Read once on mount: the answer cannot change while this screen is up.
  const [hasSavedCareer] = useState(saveExists);

  return (
    <main className="screen screen--title">
      <div className="title">
        <p className="eyebrow">{t('app.tagline')}</p>
        <h1 className="title__heading">{t('app.title')}</h1>
        <p className="title__subtitle">{t('title.subtitle')}</p>

        {state.notice && (
          <p className="notice" role="status">
            {t(state.notice)}
          </p>
        )}

        <div className="title__actions">
          {hasSavedCareer && (
            <button
              type="button"
              className="btn btn--primary btn--lg"
              onClick={() => dispatch({ type: 'CONTINUE_SAVED' })}
            >
              {t('action.continue')}
            </button>
          )}
          <button
            type="button"
            className={`btn btn--lg${hasSavedCareer ? '' : ' btn--primary'}`}
            onClick={onNewGame}
          >
            {t('action.new_game')}
          </button>
        </div>

        {hasSavedCareer && <p className="muted title__hint">{t('title.continue_hint')}</p>}
      </div>
    </main>
  );
}
