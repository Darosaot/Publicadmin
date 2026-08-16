import { useState } from 'react';
import { registry } from '../../content';
import { previewPostChange } from '../../engine/career';
import type { GameState, JobOffer } from '../../engine/types';
import { useT } from '../../i18n';
import { useGame } from '../../state/GameProvider';
import { Modal } from './Modal';

/**
 * What taking the post costs, before you take it.
 *
 * The unit has always been destroyed on every post change, and until now the only notice was a
 * log line after the fact — which is not notice. This is the warning, and it is also the only
 * place in the game where the player decides who comes with them.
 *
 * It is deliberately not a confirmation dialogue with a scary tone. Moving on is the normal shape
 * of a public career and the screen should read as a decision, not a mistake being prevented.
 */
export function PostChangeModal({
  game,
  offer,
  onClose,
}: {
  game: GameState;
  offer: JobOffer;
  onClose: () => void;
}) {
  const t = useT();
  const { dispatch } = useGame();
  const [keep, setKeep] = useState<string[]>([]);

  const preview = previewPostChange(game, registry, offer.toPost);

  const toggle = (id: string) => {
    setKeep((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : // Silently refusing the third tick would look broken; the checkboxes disable instead.
          [...current, id],
    );
  };

  return (
    <Modal
      title={t('move.heading')}
      eyebrow={t('career.offer_title', {
        title: registry.posts.find((p) => p.id === offer.toPost)?.titleKey ?? '',
        org: registry.posts.find((p) => p.id === offer.toPost)?.orgKey ?? '',
      })}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            {t('move.not_yet')}
          </button>
          <button
            type="button"
            className="btn btn--primary btn--lg"
            onClick={() => {
              dispatch({ type: 'ACCEPT_OFFER', offerId: offer.id, keep });
              onClose();
            }}
          >
            {t('move.confirm')}
          </button>
        </>
      }
    >
      <p className="modal__prose">
        {preview.handover ? t('move.handover') : t('move.body', { count: preview.losing.length })}
      </p>

      {preview.droppingInitiatives.length > 0 && (
        <p className="modal__prose muted">
          {t('move.initiatives', {
            names: preview.droppingInitiatives
              .map((id) => t(registry.initiatives.find((x) => x.id === id)?.titleKey ?? id))
              .join(', '),
          })}
        </p>
      )}

      {preview.canKeep > 0 && (
        <>
          <p className="eyebrow choices__heading">{t('move.keep_heading', { max: preview.canKeep })}</p>
          <div className="keep">
            {preview.losing.map((member) => {
              const chosen = keep.includes(member.id);
              const full = keep.length >= preview.canKeep && !chosen;

              return (
                <label key={member.id} className={`keep__row${full ? ' keep__row--full' : ''}`}>
                  <input
                    type="checkbox"
                    checked={chosen}
                    disabled={full}
                    onChange={() => toggle(member.id)}
                  />
                  <span className="keep__name">{member.name}</span>
                  <span className="keep__grade muted">{t(`team.grade.${member.seniority}`)}</span>
                </label>
              );
            })}
          </div>
        </>
      )}
    </Modal>
  );
}
