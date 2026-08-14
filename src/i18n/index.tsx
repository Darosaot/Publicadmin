/**
 * The React binding for translation. The lookup itself lives in `translate.ts`, which has no
 * React in it so build scripts and tests can use it directly.
 */

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { DEFAULT_LOCALE, translate, type LocaleId, type Translate } from './translate';

export { DEFAULT_LOCALE, translate } from './translate';
export type { LocaleId, Translate, TranslateParams } from './translate';

interface LocaleContextValue {
  locale: LocaleId;
  t: Translate;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({
  locale = DEFAULT_LOCALE,
  children,
}: {
  locale?: LocaleId;
  children: ReactNode;
}) {
  const t = useCallback<Translate>((key, params) => translate(locale, key, params), [locale]);
  const value = useMemo(() => ({ locale, t }), [locale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useT(): Translate {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useT must be used inside a LocaleProvider');
  return context.t;
}
