import { perks, registry } from '../../content';
import {
  perkBlocker,
  perkCost,
  perkPointsAvailable,
  perkPointsEarned,
  perkPointsSpent,
} from '../../engine/perks';
import { PERK_BRANCHES, type GameState, type PerkTemplate } from '../../engine/types';
import { useT } from '../../i18n';
import { useGame } from '../../state/GameProvider';
import { GameTabs } from '../components/GameTabs';
import { Portrait } from '../components/Portrait';
import { StatsBar } from '../components/StatsBar';

/**
 * The character sheet: what the career made of you, as opposed to what it currently thinks of you.
 *
 * Every number on the stats bar decays. This screen is the only place in the game showing things
 * that do not — and the only screen where the player spends something on themselves rather than
 * on a file, a person or an institution.
 *
 * Three columns, four rows, and a career affords about fourteen points against a tree costing
 * thirty. The layout makes that visible: you can see the capstone you are not going to reach from
 * the moment you take your first perk in another branch.
 */
export function SelfScreen({ game }: { game: GameState }) {
  const t = useT();

  const earned = perkPointsEarned(game);
  const spent = perkPointsSpent(game, registry);
  const available = perkPointsAvailable(game, registry);

  const tiers = [...new Set(perks.map((p) => p.tier))].sort((a, b) => a - b);

  return (
    <>
      <StatsBar game={game} />
      <GameTabs current="self" />

      <div className="layout">
        <section className="layout__main">
          <h2 className="section__title">{t('self.tree_heading')}</h2>

          <div className="tree tree--perks">
            {tiers.map((tier) => (
              <section key={tier} className="tree__tier">
                <h3 className="tree__tier-label eyebrow">
                  {t('self.tier', { tier, cost: tier })}
                </h3>
                <div className="tree__posts">
                  {PERK_BRANCHES.map((branch) => {
                    const perk = perks.find((p) => p.branch === branch && p.tier === tier);
                    if (!perk) return <div key={branch} />;
                    return <PerkCard key={perk.id} perk={perk} game={game} />;
                  })}
                </div>
              </section>
            ))}
          </div>
        </section>

        <aside className="layout__side">
          <section className="panel self__who">
            <Portrait name={game.player.name} size={96} />
            <div>
              <h2 className="panel__title">{game.player.name}</h2>
              <p className="muted">{t('self.years', { years: Math.floor(game.calendarMonth / 12) })}</p>
            </div>
          </section>

          <section className="panel">
            <h2 className="panel__title">{t('self.points_heading')}</h2>
            <p className="self__points">{t('self.points_available', { points: available })}</p>
            <p className="muted">{t('self.points_earned', { earned, spent })}</p>
            <p className="muted">{t('self.points_help')}</p>
          </section>

          <section className="panel">
            <h2 className="panel__title">{t('self.branches_heading')}</h2>
            <dl className="budget">
              {PERK_BRANCHES.map((branch) => (
                <div key={branch} className="budget__row">
                  <dt>{t(`self.branch.${branch}`)}</dt>
                  <dd>{t(`self.branch.${branch}.blurb`)}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </div>
    </>
  );
}

function PerkCard({ perk, game }: { perk: PerkTemplate; game: GameState }) {
  const t = useT();
  const { dispatch } = useGame();

  const blocker = perkBlocker(game, registry, perk.id);
  const taken = blocker === 'taken';
  const state = taken ? 'taken' : blocker === undefined ? 'open' : 'shut';

  return (
    <article className={`perk perk--${state} perk--${perk.branch}`}>
      <h4 className="perk__name">{t(perk.nameKey)}</h4>
      <p className="perk__desc">{t(perk.descKey)}</p>

      {/* The reason it cannot be taken, rather than a greyed-out card the player has to guess
          at. A tree whose gates are invisible is a tree nobody plans against. */}
      {taken ? (
        <p className="perk__state eyebrow">{t('self.perk_taken')}</p>
      ) : blocker === undefined ? (
        <button
          type="button"
          className="btn btn--primary btn--small"
          onClick={() => dispatch({ type: 'TAKE_PERK', perkId: perk.id })}
        >
          {t('self.perk_take', { cost: perkCost(perk) })}
        </button>
      ) : (
        <p className="perk__state eyebrow">
          {blocker === 'requires'
            ? t('self.perk_needs', {
                name: t(perks.find((p) => p.id === perk.requires)?.nameKey ?? ''),
              })
            : blocker === 'level'
              ? t('self.perk_needs_rank', { tier: perk.minLevel })
              : t('self.perk_needs_points', { cost: perkCost(perk) })}
        </p>
      )}
    </article>
  );
}
