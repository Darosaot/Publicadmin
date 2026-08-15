import { spotlitAlumnus } from '../engine/alumni';
import { monthOfYear, serviceYear } from '../engine/calendar';
import type { ConditionFailure } from '../engine/effects';
import type { GameState } from '../engine/types';
import type { Translate, TranslateParams } from '../i18n';

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


/**
 * The parameters narrative prose may interpolate.
 *
 * `translate` has always supported `{name}` and has always translated a parameter whose value is
 * itself a known key — the month log has relied on both since the first commit. What was missing
 * was any caller passing params to *event* prose, which is why authored text could never name a
 * generated person.
 *
 * Values here are proper nouns and will not be found in any dictionary, so they interpolate
 * literally in both locales. That is the desired behaviour and also the hazard: a staff name that
 * happened to collide with a key would be translated. The name pool is human names and the key
 * space is dotted identifiers, so a collision is not currently possible — but the day somebody
 * adds a one-word key, this is where it would surface.
 */
export function narrativeParams(game: GameState): TranslateParams {
  const alum = spotlitAlumnus(game);

  return {
    player: game.player.name,
    // Empty rather than absent: an unfilled `{alum}` would render as the literal braces, and a
    // piece of prose that names nobody should read as though it never intended to.
    alum: alum?.name ?? '',
  };
}
