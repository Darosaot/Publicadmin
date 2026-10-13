import { useCallback, useEffect, useRef, useState } from 'react';
import { registry } from '../content';
import type { GameState } from '../engine/types';
import { detectCeremonies, type Ceremony } from './ceremony';

/**
 * Watches the game and queues the moments that earn the whole screen.
 *
 * The first render has nothing before it to compare with, so a reloaded career never replays the
 * promotion it was saved in the middle of. Ceremonies are shown one at a time, oldest first.
 */
export function useCeremonies(game: GameState | null): {
  current: Ceremony | undefined;
  dismiss: () => void;
} {
  const previous = useRef<GameState | null>(game);
  const [queue, setQueue] = useState<Ceremony[]>([]);

  useEffect(() => {
    const found = detectCeremonies(previous.current, game, registry);
    previous.current = game;
    if (!game) setQueue([]);
    else if (found.length > 0) setQueue((current) => [...current, ...found]);
  }, [game]);

  const dismiss = useCallback(() => setQueue((current) => current.slice(1)), []);
  return { current: queue[0], dismiss };
}
