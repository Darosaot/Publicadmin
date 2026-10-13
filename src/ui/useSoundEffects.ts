import { useEffect, useRef } from 'react';
import type { GameState } from '../engine/types';
import { playCue, resumeAmbientIfWanted, setAudioHidden } from './sound';

/**
 * Wires the game to the sound, without a single screen having to know about it.
 *
 * Button presses are heard by one listener on the document rather than an `onClick` on every
 * button: there are dozens of them, new ones appear with every feature, and a sound added by
 * hand is a sound forgotten on the next one. State changes are heard by comparing the state with
 * the one before it, which is also why nothing here can fire on a reload — the first render has
 * nothing to compare against.
 */
export function useSoundEffects(game: GameState | null): void {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      // The first gesture of a visit is also what lets a returning player's ambience start.
      resumeAmbientIfWanted();
      const target = event.target instanceof Element ? event.target.closest('button') : null;
      if (target && !target.disabled) playCue('tap');
    };
    const onVisibility = () => setAudioHidden(document.hidden);

    document.addEventListener('click', onClick);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const previous = useRef<GameState | null>(game);
  useEffect(() => {
    const before = previous.current;
    previous.current = game;
    if (!before || !game) return;

    if (game.phase === 'report' && before.phase !== 'report') {
      playCue('report');
      return;
    }

    const shown = game.phase === 'event' ? game.pendingEvents[0] : undefined;
    const wasShown = before.phase === 'event' ? before.pendingEvents[0] : undefined;
    if (shown && !shown.resolution && shown.eventId !== wasShown?.eventId) {
      playCue('event');
      return;
    }

    // The ministry has its own, longer cue, played by the ceremony that opens that ending.
    if (game.phase === 'ended' && before.phase !== 'ended' && game.ending !== 'minister') {
      playCue('ending');
    }
  }, [game]);
}
