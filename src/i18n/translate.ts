/**
 * Key lookup and interpolation, with no React in it, so that build scripts and tests can
 * translate without pulling in a rendering layer.
 *
 * Two dictionaries are consulted for every key: the interface strings in `en/ui.ts`, and the
 * narrative strings generated from `src/content/` when it is imported.
 *
 * Parameters are interpolated as `{name}`. A parameter whose value is itself a known key is
 * translated first, which is how the month log can say "Started at Alderford" when the engine
 * only ever stored the key `career.1.org_short`.
 */

import { EN_STRINGS } from '../content';
import { uiStrings } from './en/ui';

export type LocaleId = 'en';

export const DEFAULT_LOCALE: LocaleId = 'en';

/**
 * Dictionaries are listed rather than merged so that lookups stay correct regardless of module
 * evaluation order — `EN_STRINGS` is populated as the content modules are imported.
 */
const locales: Record<LocaleId, Record<string, string>[]> = {
  en: [uiStrings, EN_STRINGS],
};

export type TranslateParams = Record<string, string | number>;
export type Translate = (key: string, params?: TranslateParams) => string;

function lookup(locale: LocaleId, key: string): string | undefined {
  for (const dictionary of locales[locale]) {
    const value = dictionary[key];
    if (value !== undefined) return value;
  }
  return undefined;
}

export function translate(locale: LocaleId, key: string, params?: TranslateParams): string {
  // A missing key shows as the key itself: loud in development, harmless in play.
  const template = lookup(locale, key) ?? key;
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (_match, name: string) => {
    const raw = params[name];
    if (raw === undefined) return `{${name}}`;
    if (typeof raw === 'number') return String(raw);
    return lookup(locale, raw) ?? raw;
  });
}
