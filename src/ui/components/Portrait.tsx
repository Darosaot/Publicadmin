import { useMemo } from 'react';
import { portraitFor, portraitRects } from '../portrait';

/**
 * A generated staff-pass photograph.
 *
 * Decorative: the person's name is always rendered next to it, so this is hidden from assistive
 * technology rather than given a label nobody would want read aloud ("portrait of Tomas
 * Bergqvist, generated"). `shapeRendering="crispEdges"` is what stops the browser antialiasing
 * the cell boundaries when the SVG is scaled up, which would undo the entire look.
 */
export function Portrait({ name, size = 64 }: { name: string; size?: number }) {
  const rects = useMemo(() => portraitRects(portraitFor(name)), [name]);

  return (
    <svg
      className="portrait"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {rects.map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.width} height={1} fill={r.fill} />
      ))}
    </svg>
  );
}
