import type { ConditionFailure } from '../engine/effects';
import type { Translate } from '../i18n';

const money = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export function formatSalary(amount: number): string {
  return money.format(amount);
}

export function formatDelta(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

/** Turns a failed condition into something a player can act on. */
export function describeFailure(t: Translate, failure: ConditionFailure): string {
  if (failure.reason === 'stat' && failure.stat && failure.required !== undefined) {
    const key = failure.comparison === 'max' ? 'event.locked.stat_max' : 'event.locked.stat_min';
    return t(key, { stat: t(`stat.${failure.stat}`).toLowerCase(), required: failure.required });
  }
  if (failure.reason === 'level') return t('event.locked.level');
  return t('event.locked.other');
}
