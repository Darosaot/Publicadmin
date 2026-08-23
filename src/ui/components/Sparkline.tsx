import type { TurnSample } from '../../engine/types';

/**
 * A stat over a whole career, drawn the way everything else in this game is drawn.
 *
 * Columns of discrete cells rather than a line. That is not a stylistic tic — `pixel.css` already
 * chops every progress bar into whole notches with a repeating gradient, on the argument that a
 * smoothly interpolated fill reads as CSS rather than as a game, and a smooth curve here would be
 * the one anti-aliased thing on the screen. Blocks also happen to be the honest rendering: the
 * underlying series is a hundred and twenty discrete cycles, not a continuous function, and a
 * curve would imply readings between them that were never taken.
 *
 * Columns are `width / n` wide with no gap, so a short career gets fat bars and a long one gets
 * thin ones and both fill the box. No axes, no gridlines, no tooltip: this sits beside a number
 * that says exactly where the stat is now, and its job is the shape.
 */
interface SparklineProps {
  history: readonly TurnSample[];
  read: (row: TurnSample) => number;
  /** Fixed for the 0–100 stats, derived for salary and savings, which have no ceiling. */
  min: number;
  max: number;
  /** Drives the colour, matching the meter for the same stat. */
  tone: string;
  label: string;
  /** Turn numbers where the post changed, drawn as a hairline behind the columns. */
  marks?: readonly number[];
}

const WIDTH = 100;
const HEIGHT = 28;

export function Sparkline({ history, read, min, max, tone, label, marks = [] }: SparklineProps) {
  if (history.length === 0) return null;

  const span = Math.max(1, max - min);
  const step = WIDTH / history.length;
  // Never thinner than a hairline: a hundred and twenty columns across a narrow card would
  // otherwise round to zero and the chart would render empty.
  const barWidth = Math.max(0.4, step);

  const first = history[0]?.turn ?? 0;
  const last = history[history.length - 1]?.turn ?? first;
  const turnSpan = Math.max(1, last - first);

  return (
    <svg
      className={`spark spark--${tone}`}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
    >
      {/* Where the job changed. Behind the data, because it is context and not a reading. */}
      {marks.map((turn) => (
        <rect
          key={turn}
          className="spark__mark"
          x={((turn - first) / turnSpan) * WIDTH}
          y={0}
          width={0.6}
          height={HEIGHT}
        />
      ))}

      {history.map((row, i) => {
        const value = Math.max(min, Math.min(max, read(row)));
        const height = ((value - min) / span) * HEIGHT;
        return (
          <rect
            key={row.turn}
            className="spark__bar"
            x={i * step}
            y={HEIGHT - height}
            width={barWidth}
            height={height}
          />
        );
      })}
    </svg>
  );
}
