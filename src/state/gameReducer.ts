/**
 * The bridge between the pure engine and React.
 *
 * The reducer holds no game rules of its own: every case delegates to an engine function and
 * stores the result. What it does own is the things that are about *playing* rather than about
 * the simulation — the allocation the player is currently drafting, which tab is open, and
 * whether we are on the title screen at all.
 */

import { registry } from '../content';
import { createGame, type NewGameOptions } from '../engine/newGame';
import { declineOffer } from '../engine/career';
import { clearSave, loadGame } from '../engine/save';
import {
  acceptOffer,
  beginNextTurn,
  chooseEventOption,
  continueAfterEvent,
  emptyAllocation,
  resolveTurn,
} from '../engine/turn';
import type { Allocation, GameState } from '../engine/types';

export type GameView = 'desk' | 'career';

export interface AppState {
  /** Null means the title screen. */
  game: GameState | null;
  /** The allocation being drafted for the current month. */
  allocation: Allocation;
  view: GameView;
  /** A one-off message for the player, such as a save that could not be read. */
  notice?: string;
}

export type GameAction =
  | { type: 'NEW_GAME'; options: NewGameOptions }
  | { type: 'CONTINUE_SAVED' }
  | { type: 'SET_TASK_EFFORT'; uid: string; points: number }
  | { type: 'SET_REST'; points: number }
  | { type: 'SET_NETWORKING'; points: number }
  | { type: 'TOGGLE_OVERTIME' }
  | { type: 'CLEAR_ALLOCATION' }
  | { type: 'END_TURN' }
  | { type: 'CHOOSE'; eventId: string; choiceId: string }
  | { type: 'CONTINUE_EVENT' }
  | { type: 'NEXT_MONTH' }
  | { type: 'ACCEPT_OFFER'; offerId: string }
  | { type: 'DECLINE_OFFER'; offerId: string }
  | { type: 'SET_VIEW'; view: GameView }
  | { type: 'ABANDON' }
  | { type: 'DISMISS_NOTICE' };

export const initialAppState: AppState = {
  game: null,
  allocation: emptyAllocation(),
  view: 'desk',
};

/** A fresh month always starts from a blank allocation on the desk tab. */
function freshTurn(state: AppState, game: GameState): AppState {
  return { ...state, game, allocation: emptyAllocation(), view: 'desk' };
}

export function gameReducer(state: AppState, action: GameAction): AppState {
  switch (action.type) {
    case 'NEW_GAME':
      return freshTurn(state, createGame(action.options, registry));

    case 'CONTINUE_SAVED': {
      const result = loadGame(registry);
      if (!result.ok) {
        clearSave();
        return {
          ...initialAppState,
          notice: result.reason === 'empty' ? undefined : 'title.save_broken',
        };
      }
      return freshTurn(state, result.state);
    }

    case 'SET_TASK_EFFORT': {
      const points = Math.max(0, Math.floor(action.points));
      const tasks = { ...state.allocation.tasks };
      if (points === 0) delete tasks[action.uid];
      else tasks[action.uid] = points;
      return { ...state, allocation: { ...state.allocation, tasks } };
    }

    case 'SET_REST':
      return {
        ...state,
        allocation: { ...state.allocation, rest: Math.max(0, Math.floor(action.points)) },
      };

    case 'SET_NETWORKING':
      return {
        ...state,
        allocation: { ...state.allocation, networking: Math.max(0, Math.floor(action.points)) },
      };

    case 'TOGGLE_OVERTIME':
      return {
        ...state,
        allocation: { ...state.allocation, overtime: !state.allocation.overtime },
      };

    case 'CLEAR_ALLOCATION':
      return { ...state, allocation: emptyAllocation() };

    case 'END_TURN': {
      if (!state.game) return state;
      const next = resolveTurn(state.game, registry, state.allocation);
      return { ...state, game: next, allocation: emptyAllocation(), view: 'desk' };
    }

    case 'CHOOSE': {
      if (!state.game) return state;
      return {
        ...state,
        game: chooseEventOption(state.game, registry, action.eventId, action.choiceId),
      };
    }

    case 'CONTINUE_EVENT': {
      if (!state.game) return state;
      return { ...state, game: continueAfterEvent(state.game, registry) };
    }

    case 'NEXT_MONTH': {
      if (!state.game) return state;
      return freshTurn(state, beginNextTurn(state.game, registry));
    }

    case 'ACCEPT_OFFER': {
      if (!state.game) return state;
      // A new post means a new desk, so any effort drafted against the old board is void.
      return {
        ...state,
        game: acceptOffer(state.game, registry, action.offerId),
        allocation: emptyAllocation(),
      };
    }

    case 'DECLINE_OFFER': {
      if (!state.game) return state;
      return { ...state, game: declineOffer(state.game, action.offerId) };
    }

    case 'SET_VIEW':
      return { ...state, view: action.view };

    case 'ABANDON':
      clearSave();
      return initialAppState;

    case 'DISMISS_NOTICE':
      return { ...state, notice: undefined };
  }
}
