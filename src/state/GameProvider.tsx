import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import { registry } from '../content';
import { getPost } from '../engine/registry';
import { hasSave, saveGame } from '../engine/save';
import { allocationTotal, effortAvailable, normalizeAllocation } from '../engine/turn';
import type { GameState } from '../engine/types';
import { gameReducer, initialAppState, type AppState, type GameAction } from './gameReducer';

interface GameContextValue {
  state: AppState;
  dispatch: Dispatch<GameAction>;
  /** Convenience derivations the screens would otherwise all recompute. */
  effortTotal: number;
  effortSpent: number;
  effortRemaining: number;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

/** Reads `?seed=` so a run can be reproduced exactly — used by the tests and for bug reports. */
function seedFromUrl(): number | undefined {
  if (typeof window === 'undefined') return undefined;
  const raw = new URLSearchParams(window.location.search).get('seed');
  if (raw === null) return undefined;
  const seed = Number.parseInt(raw, 10);
  return Number.isFinite(seed) ? seed : undefined;
}

export const URL_SEED = seedFromUrl();

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialAppState);

  // Autosave on every change to the simulation. Writing on each render would be wasteful; writing
  // only at end of turn would lose a career to a closed tab mid-event.
  useEffect(() => {
    if (state.game) saveGame(state.game);
  }, [state.game]);

  const value = useMemo<GameContextValue>(() => {
    const game = state.game;
    // Agency cover is bought with the unit's budget and paid for whether or not it is counted, so
    // it has to be in the total the screens work from — not only in the one `resolveTurn` uses.
    const effortTotal = game
      ? effortAvailable(game, registry, state.allocation.overtime, state.allocation.agencyTemps)
      : 0;
    const effortSpent = game
      ? allocationTotal(game, normalizeAllocation(game, registry, state.allocation))
      : 0;

    return {
      state,
      dispatch,
      effortTotal,
      effortSpent,
      effortRemaining: Math.max(0, effortTotal - effortSpent),
    };
  }, [state]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used inside a GameProvider');
  return context;
}

/** For screens that only run when a career is in progress. */
export function useActiveGame(): GameState {
  const { state } = useGame();
  if (!state.game) throw new Error('No game in progress');
  return state.game;
}

export function useCurrentLevel() {
  const game = useActiveGame();
  return getPost(registry, game.player.postId);
}

export function saveExists(): boolean {
  return hasSave();
}
