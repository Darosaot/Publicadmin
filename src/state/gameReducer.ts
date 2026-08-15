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
import { AGENCY_TEMP_MAX } from '../engine/constants';
import { declineOffer } from '../engine/career';
import { directiveFlag } from '../engine/directives';
import { startInitiative } from '../engine/initiatives';
import { cancelHiring, startHiring } from '../engine/team';
import { clearSave, loadGame } from '../engine/save';
import {
  acceptOffer,
  beginNextTurn,
  chooseEventOption,
  continueAfterEvent,
  emptyAllocation,
  resolveTurn,
} from '../engine/turn';
import type { Allocation, GameState, Seniority } from '../engine/types';

export type GameView = 'desk' | 'team' | 'people' | 'country' | 'initiatives' | 'career';

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
  | { type: 'SET_INITIATIVE_EFFORT'; templateId: string; points: number }
  | { type: 'SET_INITIATIVE_DELEGATION'; templateId: string; staffId: string | null }
  | { type: 'START_INITIATIVE'; templateId: string }
  | { type: 'SET_DIRECTIVE'; directiveId: string; stance: 0 | 1 | 2 }
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
  | { type: 'SET_DELEGATION'; taskUid: string; staffId: string | null }
  | { type: 'TOGGLE_COACHING'; staffId: string }
  | { type: 'TOGGLE_ONE_TO_ONE'; staffId: string }
  | { type: 'TOGGLE_TRAINING'; staffId: string }
  | { type: 'TOGGLE_RECRUITING' }
  | { type: 'SET_AGENCY_TEMPS'; count: number }
  | { type: 'START_HIRING'; seniority: Seniority }
  | { type: 'CANCEL_HIRING' }
  | { type: 'SET_VIEW'; view: GameView }
  | { type: 'ABANDON' }
  | { type: 'DISMISS_NOTICE' };

/** Adds or removes an id from a selection list. */
function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

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

    case 'SET_INITIATIVE_EFFORT': {
      const points = Math.max(0, Math.floor(action.points));
      const initiativeEffort = { ...state.allocation.initiativeEffort };
      if (points === 0) delete initiativeEffort[action.templateId];
      else initiativeEffort[action.templateId] = points;
      return { ...state, allocation: { ...state.allocation, initiativeEffort } };
    }

    case 'SET_INITIATIVE_DELEGATION': {
      const initiativeDelegations = { ...state.allocation.initiativeDelegations };
      if (action.staffId === null) delete initiativeDelegations[action.templateId];
      else initiativeDelegations[action.templateId] = action.staffId;
      return { ...state, allocation: { ...state.allocation, initiativeDelegations } };
    }

    case 'START_INITIATIVE': {
      if (!state.game) return state;
      return { ...state, game: startInitiative(state.game, registry, action.templateId) };
    }

    case 'SET_DIRECTIVE': {
      if (!state.game) return state;
      // A house rule is state, not an allocation: it holds until it is changed, which is the whole
      // difference between it and everything else the player decides.
      return {
        ...state,
        game: {
          ...state.game,
          flags: { ...state.game.flags, [directiveFlag(action.directiveId)]: action.stance },
        },
      };
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

    case 'SET_DELEGATION': {
      const delegations = { ...state.allocation.delegations };
      if (action.staffId === null) delete delegations[action.taskUid];
      else delegations[action.taskUid] = action.staffId;
      return { ...state, allocation: { ...state.allocation, delegations } };
    }

    case 'TOGGLE_COACHING':
      return { ...state, allocation: { ...state.allocation, coaching: toggle(state.allocation.coaching, action.staffId) } };

    case 'TOGGLE_ONE_TO_ONE':
      return { ...state, allocation: { ...state.allocation, oneToOnes: toggle(state.allocation.oneToOnes, action.staffId) } };

    case 'TOGGLE_TRAINING':
      return { ...state, allocation: { ...state.allocation, training: toggle(state.allocation.training, action.staffId) } };

    case 'TOGGLE_RECRUITING':
      return { ...state, allocation: { ...state.allocation, recruiting: !state.allocation.recruiting } };

    case 'SET_AGENCY_TEMPS':
      return {
        ...state,
        allocation: {
          ...state.allocation,
          agencyTemps: Math.max(0, Math.min(AGENCY_TEMP_MAX, Math.floor(action.count))),
        },
      };

    case 'START_HIRING': {
      if (!state.game) return state;
      // Opening a recruitment also commits this month's effort to it, which is what the
      // player almost always means by pressing the button.
      return {
        ...state,
        game: startHiring(state.game, action.seniority),
        allocation: { ...state.allocation, recruiting: true },
      };
    }

    case 'CANCEL_HIRING': {
      if (!state.game) return state;
      return {
        ...state,
        game: cancelHiring(state.game),
        allocation: { ...state.allocation, recruiting: false },
      };
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
