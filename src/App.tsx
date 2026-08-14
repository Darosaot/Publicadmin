import { useState } from 'react';
import { LocaleProvider } from './i18n';
import { GameProvider, useGame } from './state/GameProvider';
import { EventModal } from './ui/components/EventModal';
import { TurnReportModal } from './ui/components/TurnReportModal';
import { CareerScreen } from './ui/screens/CareerScreen';
import { DashboardScreen } from './ui/screens/DashboardScreen';
import { EndingScreen } from './ui/screens/EndingScreen';
import { NewGameScreen } from './ui/screens/NewGameScreen';
import { TeamScreen } from './ui/screens/TeamScreen';
import { TitleScreen } from './ui/screens/TitleScreen';

/**
 * Screen selection follows the game's own phase rather than a router: there is exactly one place
 * the player can be at any moment, and the engine already knows which one it is.
 */
function Router() {
  const { state } = useGame();
  const [creating, setCreating] = useState(false);
  const game = state.game;

  if (!game) {
    return creating ? (
      <NewGameScreen onBack={() => setCreating(false)} />
    ) : (
      <TitleScreen onNewGame={() => setCreating(true)} />
    );
  }

  if (game.phase === 'ended') return <EndingScreen game={game} />;

  const pending = game.phase === 'event' ? game.pendingEvents[0] : undefined;

  return (
    <main className="screen screen--game">
      {state.view === 'career' ? (
        <CareerScreen game={game} />
      ) : state.view === 'team' ? (
        <TeamScreen game={game} />
      ) : (
        <DashboardScreen game={game} />
      )}

      {pending && <EventModal game={game} pending={pending} />}
      {game.phase === 'report' && <TurnReportModal game={game} />}
    </main>
  );
}

export function App() {
  return (
    <LocaleProvider>
      <GameProvider>
        <div className="app">
          <Router />
        </div>
      </GameProvider>
    </LocaleProvider>
  );
}
