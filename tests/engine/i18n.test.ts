import { describe, expect, it } from 'vitest';
import { EN_STRINGS } from '../../src/content';
import { uiStrings as enUi } from '../../src/i18n/en/ui';
import { ES_STRINGS } from '../../src/i18n/es/content';
import { uiStrings as esUi } from '../../src/i18n/es/ui';

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
