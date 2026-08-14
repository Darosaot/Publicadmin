import { registry } from '../../content';
import { getCareerLevel } from '../../engine/registry';
import { STAT_IDS, type GameState, type StatId } from '../../engine/types';
import { useT } from '../../i18n';
import { useGame } from '../../state/GameProvider';
import { formatDelta, formatSalary } from '../format';
import { Modal } from './Modal';

/** The month in review: what got finished, what slipped, and what it did to you. */
export function TurnReportModal({ game }: { game: GameState }) {
  const t = useT();
  const { dispatch } = useGame();
  const report = game.lastReport;

  if (!report) return null;

  const moved = STAT_IDS.filter((stat) => (report.statDeltas[stat] ?? 0) !== 0);

  return (
    <Modal
      title={t('report.heading', { turn: report.turn })}
      eyebrow={t('action.end_turn')}
      footer={
        <button
          type="button"
          className="btn btn--primary btn--lg"
          onClick={() => dispatch({ type: 'NEXT_MONTH' })}
        >
          {t('action.next_month')}
        </button>
      }
    >
      {report.completed.length === 0 && report.failed.length === 0 && (
        <p className="muted">{t('report.nothing_finished')}</p>
      )}

      {report.completed.length > 0 && (
        <section className="report__section">
          <h3 className="report__heading">{t('report.completed')}</h3>
          <ul className="report__list">
            {report.completed.map((item, index) => (
              <li key={`${item.templateId}-${index}`}>
                <span>{t(registry.tasks[item.templateId]?.titleKey ?? item.templateId)}</span>
                <span className={`tag tag--${item.tier}`}>{t(`report.quality.${item.tier}`)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.failed.length > 0 && (
        <section className="report__section">
          <h3 className="report__heading">{t('report.failed')}</h3>
          <ul className="report__list">
            {report.failed.map((item, index) => (
              <li key={`${item.templateId}-${index}`}>
                <span>{t(registry.tasks[item.templateId]?.titleKey ?? item.templateId)}</span>
                <span className="tag tag--poor">{t('report.failed')}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {moved.length > 0 && (
        <section className="report__section">
          <h3 className="report__heading">{t('report.changes')}</h3>
          <ul className="report__deltas">
            {moved.map((stat) => (
              <li key={stat} className={`delta delta--${tone(stat, report.statDeltas[stat] ?? 0)}`}>
                <span>{t(`stat.${stat}`)}</span>
                <strong>{formatDelta(report.statDeltas[stat] ?? 0)}</strong>
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.review && (
        <section className="report__section report__review">
          <h3 className="report__heading">{t('report.review_heading')}</h3>
          <p className={`review review--${report.review.rating}`}>
            {t(`review.${report.review.rating}`)}
          </p>
          <p className="muted">{t(`review.${report.review.rating}.note`)}</p>
          {report.review.salaryDelta !== 0 && (
            <p className="report__salary">
              {t('report.salary_paid')}: {formatSalary(game.player.salary)} (
              {formatDelta(report.review.salaryDelta)})
            </p>
          )}
        </section>
      )}

      {report.newOffers.map((offer) => (
        <p key={offer.id} className="report__offer">
          {t('report.new_offer', { org: getCareerLevel(registry, offer.toLevel).orgShortKey })}
        </p>
      ))}
    </Modal>
  );
}

function tone(stat: StatId, delta: number): 'good' | 'bad' {
  const positiveIsGood = stat !== 'stress';
  return delta > 0 === positiveIsGood ? 'good' : 'bad';
}
