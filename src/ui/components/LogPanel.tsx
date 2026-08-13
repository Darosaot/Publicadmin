import type { LogEntry } from '../../engine/types';
import { useT } from '../../i18n';

export function LogPanel({ log }: { log: LogEntry[] }) {
  const t = useT();
  const recent = [...log].reverse().slice(0, 14);

  return (
    <section className="panel logpanel">
      <h2 className="panel__title">{t('dash.log_heading')}</h2>
      {recent.length === 0 ? (
        <p className="muted">{t('dash.log_empty')}</p>
      ) : (
        <ol className="logpanel__list">
          {recent.map((entry, index) => (
            <li key={`${entry.turn}-${entry.messageKey}-${index}`} className={`logpanel__item logpanel__item--${entry.tone}`}>
              <span className="logpanel__turn">{entry.turn}</span>
              <span>{t(entry.messageKey, entry.params)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
