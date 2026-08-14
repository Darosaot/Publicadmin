import { cast, registry } from '../../content';
import { hasTeam } from '../../engine/team';
import { useT } from '../../i18n';
import { useActiveGame, useGame } from '../../state/GameProvider';
import type { GameView } from '../../state/gameReducer';

/**
 * The top-level navigation. Team only appears once there is a unit to look at, so a junior
 * officer is never shown a screen that would be empty.
 */
export function GameTabs({ current }: { current: GameView }) {
  const t = useT();
  const game = useActiveGame();
  const { dispatch } = useGame();

  const tabs: { view: GameView; label: string; dot?: boolean }[] = [
    { view: 'desk', label: t('action.dashboard') },
  ];

  if (hasTeam(game, registry)) {
    tabs.push({
      view: 'team',
      label: t('action.team'),
      // A vacancy or someone about to walk is worth a nudge.
      dot: game.staff.some((s) => s.morale < 30) || game.hiring !== undefined,
    });
  }

  // People appears the moment there is anybody in it, and not before: an empty contacts list
  // is a worse introduction to the cast than no tab at all.
  if (cast.some((person) => game.flags[person.metFlag])) {
    tabs.push({ view: 'people', label: t('action.people') });
  }

  tabs.push({ view: 'career', label: t('action.career'), dot: game.offers.length > 0 });

  return (
    <nav className="tabs">
      {tabs.map((tab) =>
        tab.view === current ? (
          <button key={tab.view} type="button" className="tab tab--active" aria-current="page">
            {tab.label}
            {tab.dot && <span className="tab__dot" aria-hidden="true" />}
          </button>
        ) : (
          <button
            key={tab.view}
            type="button"
            className="tab"
            onClick={() => dispatch({ type: 'SET_VIEW', view: tab.view })}
          >
            {tab.label}
            {tab.dot && <span className="tab__dot" aria-hidden="true" />}
          </button>
        ),
      )}
    </nav>
  );
}
