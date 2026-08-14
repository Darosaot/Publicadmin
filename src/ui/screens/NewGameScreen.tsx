import { useState } from 'react';
import { departmentList, registry } from '../../content';
import { startingPost } from '../../engine/registry';
import type { DepartmentId, StatId } from '../../engine/types';
import { useT } from '../../i18n';
import { URL_SEED, useGame } from '../../state/GameProvider';
import { formatDelta, formatSalary } from '../format';

export function NewGameScreen({ onBack }: { onBack: () => void }) {
  const t = useT();
  const { dispatch } = useGame();

  const [name, setName] = useState('');
  const [department, setDepartment] = useState<DepartmentId | null>(null);
  const firstPost = startingPost(registry);

  const start = () => {
    if (!department) return;
    dispatch({
      type: 'NEW_GAME',
      options: { name, department, seed: URL_SEED },
    });
  };

  return (
    <main className="screen screen--newgame">
      <div className="newgame">
        <button type="button" className="btn btn--ghost newgame__back" onClick={onBack}>
          ← {t('action.back')}
        </button>

        <h1 className="newgame__heading">{t('newgame.heading')}</h1>

        <p className="newgame__post">
          {t('newgame.starting_at')}: <strong>{t(firstPost.titleKey)}</strong>,{' '}
          {t(firstPost.orgKey)} · {formatSalary(firstPost.baseSalary)}
        </p>

        <label className="field">
          <span className="field__label">{t('newgame.name_label')}</span>
          <input
            className="field__input"
            type="text"
            value={name}
            maxLength={40}
            placeholder={t('newgame.name_placeholder')}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <h2 className="newgame__subheading">{t('newgame.department_label')}</h2>
        <p className="muted newgame__hint">{t('newgame.department_hint')}</p>

        <div className="departments">
          {departmentList.map((entry) => {
            const selected = department === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                className={`deptcard${selected ? ' deptcard--selected' : ''}`}
                aria-pressed={selected}
                onClick={() => setDepartment(entry.id)}
              >
                <h3 className="deptcard__name">{t(entry.nameKey)}</h3>
                <p className="deptcard__blurb">{t(entry.blurbKey)}</p>
                <p className="deptcard__flavour">{t(entry.flavourKey)}</p>
                <p className="deptcard__adjust">
                  <span className="eyebrow">{t('newgame.adjust_label')}</span>
                  {Object.entries(entry.startingAdjustments).map(([stat, delta]) => (
                    <span
                      key={stat}
                      className={`pill pill--${(delta as number) > 0 === (stat !== 'stress') ? 'good' : 'bad'}`}
                    >
                      {t(`stat.${stat as StatId}`)} {formatDelta(delta as number)}
                    </span>
                  ))}
                </p>
              </button>
            );
          })}
        </div>

        <div className="newgame__actions">
          <button
            type="button"
            className="btn btn--primary btn--lg"
            disabled={!department}
            onClick={start}
          >
            {t('action.start')}
          </button>
        </div>
      </div>
    </main>
  );
}
