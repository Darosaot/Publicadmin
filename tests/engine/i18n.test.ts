import { describe, expect, it } from 'vitest';
import { EN_STRINGS } from '../../src/content';
import { uiStrings as enUi } from '../../src/i18n/en/ui';
import { ES_STRINGS } from '../../src/i18n/es/content';
import { uiStrings as esUi } from '../../src/i18n/es/ui';
import { isLocaleLoaded, loadLocale, translate } from '../../src/i18n/translate';

/**
 * Spanish is a full second language, not a partial one — every English key has a translated
 * counterpart. `translate.ts` falls back to English for anything missing, so a gap here would not
 * be visible in play; it would just quietly narrate part of a career in the wrong language.
 */
describe('Spanish translation coverage', () => {
  it('translates every narrative content key', () => {
    const englishKeys = Object.keys(EN_STRINGS);
    const missing = englishKeys.filter((key) => ES_STRINGS[key] === undefined);
    expect(missing).toEqual([]);
  });

  it('translates every interface string', () => {
    const englishKeys = Object.keys(enUi);
    const missing = englishKeys.filter((key) => esUi[key] === undefined);
    expect(missing).toEqual([]);
  });

  it('has no Spanish content key that is not also an English one', () => {
    const englishKeys = new Set(Object.keys(EN_STRINGS));
    const orphans = Object.keys(ES_STRINGS).filter((key) => !englishKeys.has(key));
    expect(orphans).toEqual([]);
  });

  it('has no Spanish UI key that is not also an English one', () => {
    const englishKeys = new Set(Object.keys(enUi));
    const orphans = Object.keys(esUi).filter((key) => !englishKeys.has(key));
    expect(orphans).toEqual([]);
  });
});

/**
 * Spanish is a separate chunk, so the thing worth pinning is the seam: English before it arrives,
 * Spanish after, and no throw in between.
 */
describe('lazy locale loading', () => {
  it('falls back to English until the locale is loaded, then speaks Spanish', async () => {
    const key = 'action.new_game';
    expect(isLocaleLoaded('es')).toBe(false);
    expect(translate('es', key)).toBe(enUi[key]);

    await loadLocale('es');

    expect(isLocaleLoaded('es')).toBe(true);
    expect(translate('es', key)).toBe(esUi[key]);
  });

  it('treats the default locale as always loaded', async () => {
    expect(isLocaleLoaded('en')).toBe(true);
    await expect(loadLocale('en')).resolves.toBeUndefined();
  });
});
