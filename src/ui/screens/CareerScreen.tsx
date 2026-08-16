import { useState } from 'react';
import { posts, registry } from '../../content';
import { meetsRequirements } from '../../engine/career';
import { edgeBetween, getPost, postsFrom } from '../../engine/registry';
import type { GameState, Post, PromotionRequirement } from '../../engine/types';
import { useT } from '../../i18n';
import { useGame } from '../../state/GameProvider';
import { formatSalary } from '../format';
import { GameTabs } from '../components/GameTabs';
import { PostChangeModal } from '../components/PostChangeModal';
import { StatsBar } from '../components/StatsBar';

/**
 * The career screen, which stopped being a ladder.
 *
 * A graph has no "past" and no single "next", so this shows the tree by tier: where you are, the
 * posts you could move to from here, and the ones now closed to you. Seeing the branch you did not
 * take is the point — a career is made of the doors you walked past.
 */
export function CareerScreen({ game }: { game: GameState }) {
  const t = useT();
  const { dispatch } = useGame();
  const [confirming, setConfirming] = useState<string | undefined>(undefined);

  const current = getPost(registry, game.player.postId);
  const pendingOffer = game.offers.find((o) => o.id === confirming);
  const reachable = postsFrom(registry, current.id);
  const tiers = [...new Set(posts.map((p) => p.tier))].sort((a, b) => a - b);

  return (
    <>
      <StatsBar game={game} />
      <GameTabs current="career" />

      <div className="layout">
        <section className="layout__main">
          <h2 className="section__title">{t('career.offers_heading')}</h2>

          {game.offers.length === 0 ? (
            <p className="muted">{t('career.no_offers')}</p>
          ) : (
            <div className="offers">
              {game.offers.map((offer) => {
                const post = getPost(registry, offer.toPost);
                const cyclesLeft = offer.expiresTurn - game.turn;
                return (
                  <article key={offer.id} className="offer">
                    <h3 className="offer__title">
                      {t('career.offer_title', { title: post.titleKey, org: post.orgKey })}
                    </h3>
                    <p className="offer__track">
                      {t(`track.${post.track}`)}
                      {offer.sideways && <span className="offer__sideways"> · {t('career.sideways')}</span>}
                    </p>
                    <p className="offer__salary">
                      {t('career.offer_salary', { salary: formatSalary(offer.salary) })}
                    </p>
                    <p className="offer__expiry">
                      {cyclesLeft <= 0
                        ? t('career.offer_expires_now')
                        : t('career.offer_expires', { turns: cyclesLeft })}
                    </p>
                    <div className="offer__actions">
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() =>
                          // Nothing to warn about when there is nobody to leave behind and
                          // nothing in flight, so that case takes the post directly.
                          game.staff.length === 0 && game.initiatives.length === 0
                            ? dispatch({ type: 'ACCEPT_OFFER', offerId: offer.id })
                            : setConfirming(offer.id)
                        }
                      >
                        {t('action.accept')}
                      </button>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => dispatch({ type: 'DECLINE_OFFER', offerId: offer.id })}
                      >
                        {t('action.decline')}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <h2 className="section__title">{t('career.tree_heading')}</h2>
          <div className="tree">
            {tiers.map((tier) => (
              <section key={tier} className="tree__tier">
                <h3 className="tree__tier-label eyebrow">{t('career.tier', { tier })}</h3>
                <div className="tree__posts">
                  {posts
                    .filter((p) => p.tier === tier)
                    .map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        game={game}
                        isCurrent={post.id === current.id}
                        isReachable={reachable.some((p) => p.id === post.id)}
                      />
                    ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        <aside className="layout__side">
          <section className="panel">
            <h2 className="panel__title">{t('career.current')}</h2>
            <p className="career__post">{t(current.titleKey)}</p>
            <p className="muted">{t(current.orgKey)}</p>
            <p className="muted">{t(`track.${current.track}`)}</p>
            <p className="muted">
              {t('career.since', { months: game.player.turnsAtLevel * current.monthsPerTurn })}
            </p>
          </section>

          {reachable.length === 0 ? (
            <section className="panel">
              <h2 className="panel__title">{t('career.tree_heading')}</h2>
              <p className="muted">{t('career.top_of_ladder')}</p>
            </section>
          ) : (
            reachable.map((post) => {
              const edge = edgeBetween(registry, current.id, post.id);
              if (!edge) return null;
              return (
                <section key={post.id} className="panel">
                  <h2 className="panel__title">
                    {t('career.requirements_heading', { title: post.titleKey })}
                  </h2>
                  <Requirements game={game} requirement={edge.requires} />
                  {meetsRequirements(game, registry, post.id) && (
                    <p className="requirements__ready">{t('career.qualified')}</p>
                  )}
                </section>
              );
            })
          )}
        </aside>
      </div>

      {pendingOffer && (
        <PostChangeModal
          game={game}
          offer={pendingOffer}
          onClose={() => setConfirming(undefined)}
        />
      )}
    </>
  );
}

function PostCard({
  post,
  game,
  isCurrent,
  isReachable,
}: {
  post: Post;
  game: GameState;
  isCurrent: boolean;
  isReachable: boolean;
}) {
  const t = useT();

  // A post on another branch at your own tier is not "behind you" — it is the job you did not
  // take, which is a different and more interesting thing to be told.
  const status = isCurrent
    ? 'current'
    : isReachable
      ? 'open'
      : post.tier === game.player.level
        ? 'missed'
        : post.tier < game.player.level
          ? 'past'
          : 'closed';

  return (
    <article className={`rung rung--${status} rung--${post.track}`}>
      <span className="rung__status eyebrow">{t(`career.post_${status}`)}</span>
      <h4 className="rung__title">{t(post.titleKey)}</h4>
      <p className="rung__org">{t(post.orgKey)}</p>
      <p className="rung__salary muted">
        {formatSalary(post.baseSalary)} · {t(`track.${post.track}`)}
      </p>
      {/* Whether there is a unit only becomes a decision once the tree forks, so saying "no
          unit" on a junior desk would read as a loss rather than as what the post is. */}
      {post.tier >= 3 && (
        <p className="rung__unit muted">
          {post.headcount
            ? t('career.unit_of', { count: post.headcount })
            : t('career.no_unit')}
        </p>
      )}
    </article>
  );
}

function Requirements({
  game,
  requirement,
}: {
  game: GameState;
  requirement: PromotionRequirement;
}) {
  const t = useT();

  const rows: { label: string; current: number; required: number; months?: boolean }[] = [
    {
      label: t('stat.reputation'),
      current: game.stats.reputation,
      required: requirement.minReputation,
    },
    {
      label: t('stat.performance'),
      current: game.stats.performance,
      required: requirement.minPerformance,
    },
  ];

  if (requirement.minPoliticalCapital !== undefined) {
    rows.push({
      label: t('stat.politicalCapital'),
      current: game.stats.politicalCapital,
      required: requirement.minPoliticalCapital,
    });
  }

  rows.push({
    label: t('career.requirement_time'),
    current: game.player.turnsAtLevel,
    required: requirement.minTurnsAtLevel,
    months: true,
  });

  return (
    <ul className="requirements">
      {rows.map((row) => {
        const met = row.current >= row.required;
        return (
          <li key={row.label} className={`requirement${met ? ' requirement--met' : ''}`}>
            <span>{row.label}</span>
            <span className="requirement__value">
              {met
                ? t('career.requirement_met')
                : row.months
                  ? t('career.requirement_months', {
                      current: row.current,
                      required: row.required,
                    })
                  : t('career.requirement_short', {
                      current: row.current,
                      required: row.required,
                    })}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
