import { LOCALE_IDS, useLocale, useT, type LocaleId } from '../../i18n';

const LABELS: Record<LocaleId, string> = { en: 'English', es: 'Español' };

export function LanguageSwitcher() {
  const t = useT();
  const { locale, setLocale } = useLocale();

  return (
    <div className="language-switcher" role="group" aria-label={t('title.language')}>
      {LOCALE_IDS.map((id) => (
        <button
          key={id}
          type="button"
          className={`language-switcher__option${id === locale ? ' language-switcher__option--active' : ''}`}
          aria-pressed={id === locale}
          onClick={() => setLocale(id)}
        >
          {LABELS[id]}
        </button>
      ))}
    </div>
  );
}
