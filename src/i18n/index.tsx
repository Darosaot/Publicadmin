/**
 * The React binding for translation. The lookup itself lives in `translate.ts`, which has no
 * React in it so build scripts and tests can use it directly.
 *
 * The provider owns which locale is active and persists the choice to `localStorage`, separately
 * from the game save — the language you read in is a device preference, not part of a career.
 */

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_LOCALE, LOCALE_IDS, translate, type LocaleId, type Translate } from './translate';

export { DEFAULT_LOCALE, LOCALE_IDS, translate } from './translate';
export type { LocaleId, Translate, TranslateParams } from './translate';

const STORAGE_KEY = 'publicadmin.locale';

function readStorage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

function isLocaleId(value: string): value is LocaleId {
  return (LOCALE_IDS as readonly string[]).includes(value);
}

function initialLocale(): LocaleId {
  const stored = readStorage()?.getItem(STORAGE_KEY);
  return stored && isLocaleId(stored) ? stored : DEFAULT_LOCALE;
}

interface LocaleContextValue {
  locale: LocaleId;
  t: Translate;
  setLocale: (locale: LocaleId) => void;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleId>(initialLocale);

  const setLocale = useCallback((next: LocaleId) => {
    setLocaleState(next);
    readStorage()?.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback<Translate>((key, params) => translate(locale, key, params), [locale]);
  const value = useMemo(() => ({ locale, t, setLocale }), [locale, t, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function useLocaleContext(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useT/useLocale must be used inside a LocaleProvider');
  return context;
}

export function useT(): Translate {
  return useLocaleContext().t;
}

export function useLocale(): { locale: LocaleId; setLocale: (locale: LocaleId) => void } {
  const { locale, setLocale } = useLocaleContext();
  return { locale, setLocale };
}
