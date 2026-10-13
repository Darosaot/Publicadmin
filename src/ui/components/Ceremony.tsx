import { useEffect, useRef } from 'react';
import { registry } from '../../content';
import { getPost } from '../../engine/registry';
import { useT } from '../../i18n';
import { useGame } from '../../state/GameProvider';
import type { Ceremony as CeremonyData } from '../ceremony';
import { playCue, type Cue } from '../sound';
import { Portrait } from './Portrait';

/** Which sound goes with which moment. */
const CUE_FOR: Record<CeremonyData['kind'], Cue> = {
  promotion: 'promotion',
  initiative: 'achievement',
  farewell: 'farewell',
  ministry: 'ministry',
};

/**
 * A moment given the whole screen.
 *
 * The engine separates a landed nine-year initiative from a routine month, but the interface used
 * to put both in the same modal at the same size. This is the other size: nothing else on the
 * page, one thing said, and a single button that takes as long as the player wants to press it.
 *
 * It never blocks the game from being saved or left. It is drawn over whatever screen the player
 * is on and carries no state of its own; dismissing it only means it has been seen.
 */
export function Ceremony({ ceremony, onDone }: { ceremony: CeremonyData; onDone: () => void }) {
  const t = useT();
  const { state } = useGame();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    playCue(CUE_FOR[ceremony.kind]);
    buttonRef.current?.focus();
  }, [ceremony]);

  let eyebrow: string;
  let title: string;
  let subtitle: string | undefined;
  let prose: string;
  let face: string | undefined;

  switch (ceremony.kind) {
    case 'promotion': {
      const post = getPost(registry, ceremony.postId);
      eyebrow = t('ceremony.promotion.eyebrow');
      title = t(post.titleKey);
      subtitle = t(post.orgKey);
      prose = t(`ceremony.promotion.tier_${ceremony.tier}`);
      break;
    }
    case 'initiative': {
      const template = registry.initiatives.find((x) => x.id === ceremony.templateId);
      eyebrow = t('ceremony.initiative.eyebrow');
      title = t(template?.titleKey ?? ceremony.templateId);
      prose = t(template?.completeKey ?? '');
      break;
    }
    case 'farewell': {
      eyebrow = t('ceremony.farewell.eyebrow');
      title = ceremony.name;
      prose = t(`ceremony.farewell.${ceremony.reason}`, {
        name: ceremony.name,
        years: ceremony.years,
      });
      face = ceremony.name;
      break;
    }
    case 'ministry': {
      eyebrow = t('ceremony.ministry.eyebrow');
      title = t('ending.minister.title');
      subtitle = state.game?.player.name;
      prose = t('ceremony.ministry.body');
      break;
    }
  }

  return (
    <div className={`ceremony ceremony--${ceremony.kind}`}>
      <div
        className="ceremony__stage"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ceremony-title"
      >
        <p className="ceremony__eyebrow">{eyebrow}</p>
        {face && (
          <div className="ceremony__face">
            <Portrait name={face} size={96} />
          </div>
        )}
        <h2 className="ceremony__title" id="ceremony-title">
          {title}
        </h2>
        {subtitle && <p className="ceremony__subtitle">{subtitle}</p>}
        <p className="ceremony__prose">{prose}</p>
        <button
          ref={buttonRef}
          type="button"
          className="btn btn--primary btn--lg ceremony__continue"
          onClick={onDone}
        >
          {t('action.continue_story')}
        </button>
      </div>
    </div>
  );
}
