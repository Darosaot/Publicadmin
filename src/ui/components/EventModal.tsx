import { registry } from '../../content';
import { checkCondition } from '../../engine/effects';
import type { GameState, PendingEvent } from '../../engine/types';
import { useT } from '../../i18n';
import { useGame } from '../../state/GameProvider';
import { describeFailure } from '../format';
import { Modal } from './Modal';

/**
 * One decision at a time.
 *
 * Choices the player does not qualify for are rendered disabled with the reason attached rather
 * than hidden — seeing the door you cannot open is part of the game.
 */
export function EventModal({ game, pending }: { game: GameState; pending: PendingEvent }) {
  const t = useT();
  const { dispatch } = useGame();

  const event = registry.events[pending.eventId];
  if (!event) return null;

  const resolution = pending.resolution;

  return (
    <Modal
      title={t(event.titleKey)}
      eyebrow={t('dash.month', { turn: game.turn })}
      footer={
        resolution && (
          <button
            type="button"
            className="btn btn--primary btn--lg"
            onClick={() => dispatch({ type: 'CONTINUE_EVENT' })}
          >
            {t('action.continue')}
          </button>
        )
      }
    >
      <p className="modal__prose">{t(event.bodyKey)}</p>

      {resolution ? (
        <div className="outcome">
          <p className="outcome__chosen">
            {t(event.choices.find((c) => c.id === resolution.choiceId)?.labelKey ?? '')}
          </p>
          <p className="modal__prose outcome__text">{t(resolution.textKey)}</p>
        </div>
      ) : (
        <>
          <p className="eyebrow choices__heading">{t('event.choose')}</p>
          <div className="choices">
            {event.choices.map((choice) => {
              const failure = checkCondition(game, choice.conditions);
              return (
                <button
                  key={choice.id}
                  type="button"
                  className="choice"
                  disabled={failure !== undefined}
                  onClick={() =>
                    dispatch({ type: 'CHOOSE', eventId: event.id, choiceId: choice.id })
                  }
                >
                  <span className="choice__label">{t(choice.labelKey)}</span>
                  {failure && (
                    <span className="choice__locked">
                      {t('event.locked', { reason: describeFailure(t, failure) })}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </Modal>
  );
}
