import { monthOfYear, serviceYear } from '../engine/calendar';
import type { ConditionFailure } from '../engine/effects';
import type { GameState } from '../engine/types';
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

/**
 * Where you are in the career, in the calendar rather than in turns.
 *
 * At a junior desk the months tick one at a time; from a directorate they arrive a quarter at a
 * time, which is the visible signal that the job has changed shape.
 */
export function formatDate(t: Translate, game: GameState): string {
  return t('dash.date', {
    month: t(`month.${monthOfYear(game)}`),
    year: serviceYear(game),
  });
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
