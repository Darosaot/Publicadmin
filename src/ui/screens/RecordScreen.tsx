import { registry } from '../../content';
import { MAX_TURNS } from '../../engine/constants';
import { range, spells } from '../../engine/history';
import { STAT_IDS, type GameState, type StatId, type TurnSample } from '../../engine/types';
import { useT } from '../../i18n';
import { formatSalary } from '../format';
import { GameTabs } from '../components/GameTabs';
import { Sparkline } from '../components/Sparkline';
import { StatsBar } from '../components/StatsBar';

/**
 * The career, looked at from the outside.
 *
 * Every other screen in this game is in the present tense — this month's board, this month's
 * unit, the offers open right now. That was a strange gap in a game whose whole subject is thirty
 * years: a player could reach retirement without ever having seen the shape of the thing they
 * spent an evening making.
 *
 * The five stats are drawn on a fixed 0–100 axis and money on a derived one, which is deliberate.
 * A stat auto-scaled to its own range would make a career that never moved look as dramatic as
 * one that swung from 20 to 90; the point of a fixed axis is that a flat line means flat.
 *
 * Post changes are ruled behind every chart, so the question a player actually has — *was it the
 * new job that did this* — is answerable by looking rather than by remembering.
 */

const READERS: Record<StatId, (row: TurnSample) => number> = {
  reputation: (r) => r.reputation,
  performance: (r) => r.performance,
  politicalCapital: (r) => r.politicalCapital,
  integrity: (r) => r.integrity,
  stress: (r) => r.stress,
};

export function RecordScreen({ game }: { game: GameState }) {
  const t = useT();
  const history = game.history;
  const held = spells(history);

  // The turn each post began, minus the first — a rule at the very start of the chart would mark
  // the career beginning, which is not news.
  const changes = held.slice(1).map((spell) => spell.fromTurn);

  const salary = range(history, (r) => r.salary);
  const savings = range(history, (r) => r.savings);

  return (
    <>
      <StatsBar game={game} />
      <GameTabs current="record" />

      <div className="layout">
        <section className="layout__main">
          <h2 className="section__title">{t('record.heading')}</h2>

          {history.length === 0 ? (
            <p className="muted">{t('record.empty')}</p>
          ) : (
            <>
              <div className="charts">
                {STAT_IDS.map((stat) => {
                  const now = game.stats[stat];
                  return (
                    <article key={stat} className="chart">
                      <div className="chart__head">
                        <h3 className="chart__label">{t(`stat.${stat}`)}</h3>
                        <span className="chart__now">{now}</span>
                      </div>
                      <Sparkline
                        history={history}
                        read={READERS[stat]}
                        min={0}
                        max={100}
                        tone={stat}
                        marks={changes}
                        label={t('record.chart_of', { stat: t(`stat.${stat}`) })}
                      />
                    </article>
                  );
                })}

                <article className="chart">
                  <div className="chart__head">
                    <h3 className="chart__label">{t('stat.salary')}</h3>
                    <span className="chart__now">{formatSalary(game.player.salary)}</span>
                  </div>
                  <Sparkline
                    history={history}
                    read={(r) => r.salary}
                    min={0}
                    max={Math.max(1, salary.max)}
                    tone="salary"
                    marks={changes}
                    label={t('record.chart_of', { stat: t('stat.salary') })}
                  />
                </article>

                <article className="chart">
                  <div className="chart__head">
                    <h3 className="chart__label">{t('record.savings')}</h3>
                    <span className="chart__now">{formatSalary(game.player.savings)}</span>
                  </div>
                  {/* Floored at zero rather than at the minimum, so a career that went into the
                      red shows it as a gap in the columns instead of quietly rebasing the axis. */}
                  <Sparkline
                    history={history}
                    read={(r) => r.savings}
                    min={Math.min(0, savings.min)}
                    max={Math.max(1, savings.max)}
                    tone="savings"
                    marks={changes}
                    label={t('record.chart_of', { stat: t('record.savings') })}
                  />
                </article>
              </div>

              <h2 className="section__title">{t('record.posts_heading')}</h2>
              <ol className="spells">
                {held.map((spell) => {
                  const post = registry.posts.find((p) => p.id === spell.postId);
                  const months = spell.toMonth - spell.fromMonth + 1;
                  return (
                    <li key={`${spell.postId}-${spell.fromTurn}`} className="spell">
                      <span className="spell__years">
                        {t('record.years', {
                          from: Math.floor(spell.fromMonth / 12) + 1,
                          to: Math.floor(spell.toMonth / 12) + 1,
                        })}
                      </span>
                      <span className="spell__title">
                        {post ? t(post.titleKey) : spell.postId}
                      </span>
                      <span className="spell__org muted">{post ? t(post.orgKey) : ''}</span>
                      <span className="spell__span muted">
                        {t('record.months', { count: months })}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </>
          )}
        </section>

        <aside className="layout__side">
          <section className="panel">
            <h2 className="panel__title">{t('record.about_heading')}</h2>
            <p className="muted">{t('record.about')}</p>
          </section>

          {history.length > 0 && (
            <section className="panel">
              <h2 className="panel__title">{t('record.covered_heading')}</h2>
              <p className="muted">
                {t('record.covered', {
                  cycles: history.length,
                  max: MAX_TURNS,
                  posts: held.length,
                })}
              </p>
              {/* A career that predates the record keeps its own honesty: it says what it can
                  account for rather than drawing an arc nobody took. */}
              {history[0] && history[0].turn > 1 && (
                <p className="muted">{t('record.partial', { from: history[0].turn })}</p>
              )}
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
