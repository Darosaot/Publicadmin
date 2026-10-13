import { useRef } from 'react';
import { readRawSave, saveFileName, serialize } from '../../engine/save';
import { useT } from '../../i18n';
import { useGame } from '../../state/GameProvider';
import { setSoundOn, soundAvailable, useSoundOn } from '../sound';

/**
 * The small print along the bottom: sound, and taking a career in or out of the browser.
 *
 * These are about the device, not the career, which is why they live outside every screen and are
 * the same on the title page as in the middle of a month. A save file is the same JSON the game
 * keeps in `localStorage` after every action, so exporting is a copy and importing goes through
 * the same migrations and clean-up as a normal load.
 */
export function UtilityBar() {
  const t = useT();
  const { state, dispatch } = useGame();
  const soundOn = useSoundOn();
  const fileRef = useRef<HTMLInputElement>(null);

  const game = state.game;

  const exportSave = () => {
    // The live state when there is one, so the file includes the half-played month.
    const json = game ? serialize(game) : readRawSave();
    if (!json) return;
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = game ? saveFileName(game) : 'public-service-story-save.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSave = async (file: File | undefined) => {
    if (!file) return;
    // Replacing a career in progress is the one thing here that cannot be undone.
    if (game && game.phase !== 'ended' && !window.confirm(t('save.import_confirm'))) return;
    const json = await file.text();
    dispatch({ type: 'IMPORT_SAVE', json });
  };

  const canExport = game !== null || readRawSave() !== null;

  return (
    <footer className="utility">
      {/* The title screen shows its own notices; in a game there is nowhere else to say it. */}
      {game && state.notice && (
        <p className="utility__notice" role="status">
          {t(state.notice)}{' '}
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => dispatch({ type: 'DISMISS_NOTICE' })}
          >
            {t('action.dismiss')}
          </button>
        </p>
      )}

      <div className="utility__row">
        {soundAvailable() && (
          <button
            type="button"
            className="btn btn--ghost"
            aria-pressed={soundOn}
            onClick={() => setSoundOn(!soundOn)}
          >
            {soundOn ? t('sound.on') : t('sound.off')}
          </button>
        )}
        <button type="button" className="btn btn--ghost" disabled={!canExport} onClick={exportSave}>
          {t('save.export')}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => fileRef.current?.click()}>
          {t('save.import')}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="utility__file"
          aria-label={t('save.import')}
          onChange={(event) => {
            const input = event.currentTarget;
            void importSave(input.files?.[0]).finally(() => {
              // So choosing the same file twice still fires.
              input.value = '';
            });
          }}
        />
      </div>
    </footer>
  );
}
