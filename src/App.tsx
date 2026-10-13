import { useState } from 'react';
import { LocaleProvider } from './i18n';
import { GameProvider, useGame } from './state/GameProvider';
import { Ceremony } from './ui/components/Ceremony';
import { UtilityBar } from './ui/components/UtilityBar';
import { useCeremonies } from './ui/useCeremonies';
import { useSoundEffects } from './ui/useSoundEffects';
import { EventModal } from './ui/components/EventModal';
import { TurnReportModal } from './ui/components/TurnReportModal';
import { CareerScreen } from './ui/screens/CareerScreen';
import { CountryScreen } from './ui/screens/CountryScreen';
import { DashboardScreen } from './ui/screens/DashboardScreen';
import { EndingScreen } from './ui/screens/EndingScreen';
import { InitiativesScreen } from './ui/screens/InitiativesScreen';
import { SelfScreen } from './ui/screens/SelfScreen';
import { NewGameScreen } from './ui/screens/NewGameScreen';
import { PeopleScreen } from './ui/screens/PeopleScreen';
import { RecordScreen } from './ui/screens/RecordScreen';
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

  useSoundEffects(game);
  const ceremonies = useCeremonies(game);
  const ceremony = ceremonies.current && (
    <Ceremony ceremony={ceremonies.current} onDone={ceremonies.dismiss} />
  );

  if (!game) {
    return creating ? (
      <NewGameScreen onBack={() => setCreating(false)} />
    ) : (
      <TitleScreen onNewGame={() => setCreating(true)} />
    );
  }

  if (game.phase === 'ended') {
    return (
      <>
        <EndingScreen game={game} />
        {ceremony}
      </>
    );
  }

  const pending = game.phase === 'event' ? game.pendingEvents[0] : undefined;

  return (
    <main className="screen screen--game">
      {state.view === 'career' ? (
        <CareerScreen game={game} />
      ) : state.view === 'team' ? (
        <TeamScreen game={game} />
      ) : state.view === 'people' ? (
        <PeopleScreen game={game} />
      ) : state.view === 'country' ? (
        <CountryScreen game={game} />
      ) : state.view === 'self' ? (
        <SelfScreen game={game} />
      ) : state.view === 'initiatives' ? (
        <InitiativesScreen game={game} />
      ) : state.view === 'record' ? (
        <RecordScreen game={game} />
      ) : (
        <DashboardScreen game={game} />
      )}

      {pending && <EventModal game={game} pending={pending} />}
      {game.phase === 'report' && <TurnReportModal game={game} />}
      {ceremony}
    </main>
  );
}

export function App() {
  return (
    <LocaleProvider>
      <GameProvider>
        <div className="app">
          <Router />
          <UtilityBar />
        </div>
      </GameProvider>
    </LocaleProvider>
  );
}
