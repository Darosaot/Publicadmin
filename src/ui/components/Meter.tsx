import type { StatId } from '../../engine/types';
import { formatDelta } from '../format';

interface MeterProps {
  label: string;
  value: number;
  stat: StatId;
  /** Shown as a small marker beside the value when the stat moved this month. */
  delta?: number;
  title?: string;
  max?: number;
}

export function Meter({ label, value, stat, delta, title, max = 100 }: MeterProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  // Stress is the one meter where a full bar is bad news, so it warns as it fills.
  const danger = stat === 'stress' && value >= 70;

  return (
    <div className="meter" title={title}>
      <div className="meter__head">
        <span className="meter__label">{label}</span>
        <span className="meter__value">
          {value}
          {delta !== undefined && delta !== 0 && (
            <span className={`meter__delta meter__delta--${deltaTone(stat, delta)}`}>
              {formatDelta(delta)}
            </span>
          )}
        </span>
      </div>
      <div
        className="meter__track"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={`meter__fill meter__fill--${stat}${danger ? ' meter__fill--danger' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Rising stress is bad; rising everything else is good. */
function deltaTone(stat: StatId, delta: number): 'good' | 'bad' {
  const positiveIsGood = stat !== 'stress';
  return delta > 0 === positiveIsGood ? 'good' : 'bad';
}
