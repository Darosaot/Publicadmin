interface EffortStepperProps {
  value: number;
  onChange: (value: number) => void;
  /** How many more points the player can afford right now. */
  headroom: number;
  addLabel: string;
  removeLabel: string;
  max?: number;
}

/**
 * Plus/minus rather than a slider: exact at a glance, reachable by keyboard, and a stable target
 * for the browser tests. Effort is a handful of whole points, not a continuous quantity.
 */
export function EffortStepper({
  value,
  onChange,
  headroom,
  addLabel,
  removeLabel,
  max,
}: EffortStepperProps) {
  const canAdd = headroom > 0 && (max === undefined || value < max);

  return (
    <div className="stepper">
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(value - 1)}
        disabled={value <= 0}
        aria-label={removeLabel}
      >
        −
      </button>
      <span className="stepper__value" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(value + 1)}
        disabled={!canAdd}
        aria-label={addLabel}
      >
        +
      </button>
    </div>
  );
}
