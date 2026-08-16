/**
 * Regenerates `docs/narrative-script.md` from the shipped content.
 *
 * The script is a *reading* document — the whole corpus in one place, so it can be reviewed as
 * writing rather than as code. Generating it rather than maintaining it by hand is the only way
 * to guarantee it still describes the game a year from now.
 *
 *   npm run docs:script
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  allEvents,
  allTasks,
  bodies,
  departmentList,
  directives,
  endingCopy,
  initiatives,
  posts,
} from '../src/content';
import { translate } from '../src/i18n/translate';
import type { Condition, Effect, GameEvent, TaskTemplate } from '../src/engine/types';
import { ENDING_IDS, STAT_IDS } from '../src/engine/types';

const t = (key: string) => translate('en', key);

const STAT_LABEL: Record<string, string> = {
  reputation: 'Reputation',
  performance: 'Performance',
  politicalCapital: 'Political capital',
  integrity: 'Integrity',
  stress: 'Stress',
};

function signed(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

function describeEffect(effect: Effect): string {
  switch (effect.kind) {
    case 'stat':
      return `${STAT_LABEL[effect.stat] ?? effect.stat} ${signed(effect.delta)}`;
    case 'salary':
      return `Salary ${signed(effect.delta)}`;
    case 'flag':
      return `flag \`${effect.flag}\`${effect.value === false ? ' cleared' : ''}`;
    case 'flagDelta':
      return `\`${effect.flag}\` ${signed(effect.delta)}`;
    case 'spawnTask':
      return `new task: ${t(`${effect.templateId}.title`)}`;
    case 'queueEvent': {
      const delay = effect.delayTurns ?? 0;
      return `schedules "${t(`${effect.eventId}.title`)}"${delay ? ` in ${delay} cycles` : ''}`;
    }
    case 'endGame':
      return `**ends the career: ${effect.ending}**`;
    case 'teamMorale':
      return `team morale ${signed(effect.delta)}`;
    case 'teamSkill':
      return `team skill ${signed(effect.delta)}`;
    case 'budget':
      return `budget balance ${signed(effect.delta)}`;
    case 'budgetMonthly':
      return `monthly budget ${signed(effect.delta)}`;
    case 'loseStaff':
      return 'a member of staff leaves';
    case 'gainStaff':
      return `a ${effect.seniority} joins`;
  }
}

function describeCondition(condition: Condition | undefined): string {
  if (!condition) return '';
  const parts: string[] = [];

  if (condition.departments) parts.push(condition.departments.join('/'));
  if (condition.minLevel !== undefined && condition.maxLevel !== undefined) {
    parts.push(
      condition.minLevel === condition.maxLevel
        ? `level ${condition.minLevel}`
        : `levels ${condition.minLevel}–${condition.maxLevel}`,
    );
  } else if (condition.minLevel !== undefined) {
    parts.push(`level ${condition.minLevel}+`);
  } else if (condition.maxLevel !== undefined) {
    parts.push(`up to level ${condition.maxLevel}`);
  }
  if (condition.minTurn !== undefined) parts.push(`cycle ${condition.minTurn}+`);
  if (condition.minYearsElapsed !== undefined) {
    parts.push(`year ${condition.minYearsElapsed}+`);
  }

  for (const stat of STAT_IDS) {
    const min = condition.minStat?.[stat];
    const max = condition.maxStat?.[stat];
    if (min !== undefined) parts.push(`${STAT_LABEL[stat]} ≥ ${min}`);
    if (max !== undefined) parts.push(`${STAT_LABEL[stat]} ≤ ${max}`);
  }

  for (const flag of condition.requiredFlags ?? []) parts.push(`\`${flag}\``);
  for (const flag of condition.forbiddenFlags ?? []) parts.push(`not \`${flag}\``);
  for (const [flag, min] of Object.entries(condition.minFlag ?? {})) {
    parts.push(`\`${flag}\` ≥ ${min}`);
  }
  for (const [flag, max] of Object.entries(condition.maxFlag ?? {})) {
    parts.push(`\`${flag}\` ≤ ${max}`);
  }

  return parts.join(', ');
}

function renderEvent(event: GameEvent): string {
  const lines: string[] = [];
  const gate = describeCondition(event.conditions);

  lines.push(`#### ${t(event.titleKey)}`);
  lines.push('');

  const meta = [`\`${event.id}\``];
  if (event.kind === 'random') meta.push(`weight ${event.weight}`);
  if (event.once) meta.push('once per career');
  if (gate) meta.push(gate);
  lines.push(`*${meta.join(' · ')}*`);
  lines.push('');
  lines.push(`> ${t(event.bodyKey).replace(/\n/g, '\n> ')}`);
  lines.push('');

  for (const choice of event.choices) {
    const choiceGate = describeCondition(choice.conditions);
    lines.push(`**${t(choice.labelKey)}**${choiceGate ? ` *(requires ${choiceGate})*` : ''}`);
    lines.push('');

    const multiple = choice.outcomes.length > 1;
    for (const outcome of choice.outcomes) {
      const bits: string[] = [];
      if (multiple) bits.push(`weight ${outcome.weight}`);
      const outcomeGate = describeCondition(outcome.conditions);
      if (outcomeGate) bits.push(`only if ${outcomeGate}`);

      const effects = outcome.effects.map(describeEffect).join(' · ') || 'no change';
      const prefix = bits.length > 0 ? `*(${bits.join('; ')})* ` : '';
      lines.push(`- ${prefix}${t(outcome.textKey)}`);
      lines.push(`  <br>↳ ${effects}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function renderTask(task: TaskTemplate): string {
  const scope = task.departments === 'any' ? 'any desk' : task.departments.join('/');
  const [min, max] = task.deadlineRange;
  const level =
    task.minLevel !== undefined || task.maxLevel !== undefined
      ? `, level ${task.minLevel ?? 1}${task.maxLevel ? `–${task.maxLevel}` : '+'}`
      : '';

  const consequences: string[] = [];
  for (const [tier, effects] of Object.entries(task.onComplete ?? {})) {
    consequences.push(`${tier}: ${effects.map(describeEffect).join(' · ')}`);
  }
  if (task.onFail?.length) {
    consequences.push(`missed: ${task.onFail.map(describeEffect).join(' · ')}`);
  }

  return [
    `| ${t(task.titleKey)} | ${scope}${level} | ${task.baseEffort} | ${min}–${max} | ${task.difficulty} | ${consequences.join('; ') || '—'} |`,
  ].join('\n');
}

function taskTable(title: string, tasks: TaskTemplate[]): string {
  return [
    `### ${title}`,
    '',
    '| Task | Desk | Effort | Deadline | Difficulty | Consequences |',
    '| --- | --- | --- | --- | --- | --- |',
    ...tasks.map(renderTask),
    '',
    ...tasks.map((task) => `**${t(task.titleKey)}** — ${t(task.descKey)}`),
    '',
  ].join('\n');
}

function build(): string {
  const out: string[] = [];

  out.push('# Narrative Script');
  out.push('');
  out.push(
    '> **Generated file.** Produced from the shipped content by `npm run docs:script`. Edit the',
    '> content in `src/content/` and regenerate — changes made directly to this file are lost.',
  );
  out.push('');
  out.push(
    `The complete corpus: ${allEvents.length} events, ${allTasks.length} task templates, ` +
      `${initiatives.length} initiatives, ${bodies.length} public bodies, ` +
      `${directives.length} standing directives, ${departmentList.length} departments, ` +
      `${posts.length} posts across ${new Set(posts.map((p) => p.track)).size} tracks and ` +
      `${ENDING_IDS.length} endings. Stat effects are shown after each outcome.`,
  );
  out.push('');

  /* --------------------------------------------------------- departments */

  out.push('## Departments');
  out.push('');
  for (const department of departmentList) {
    const adjustments = Object.entries(department.startingAdjustments)
      .map(([stat, delta]) => `${STAT_LABEL[stat] ?? stat} ${signed(delta as number)}`)
      .join(', ');
    out.push(`### ${t(department.nameKey)}`);
    out.push('');
    out.push(`*Starting adjustment: ${adjustments || 'none'}*`);
    out.push('');
    out.push(t(department.blurbKey));
    out.push('');
    out.push(`> ${t(department.flavourKey)}`);
    out.push('');
  }

  /* -------------------------------------------------------------- career */

  out.push('## The career tree');
  out.push('');
  out.push(
    'Everyone starts in Alderford. After that the tree forks, and posts sharing a tier are ' +
      'alternatives rather than steps.',
  );
  out.push('');

  const byTier = [...new Set(posts.map((p) => p.tier))].sort((a, b) => a - b);
  for (const tier of byTier) {
    out.push(`### Tier ${tier}`);
    out.push('');
    out.push('| Post | Track | Administration | Salary | Effort | Slots | Cycle | Unit | Reached from |');
    out.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
    for (const post of posts.filter((p) => p.tier === tier)) {
      const routes =
        post.from.length === 0
          ? 'where every career starts'
          : post.from
              .map((edge) => {
                const source = posts.find((p) => p.id === edge.from);
                const req = [
                  `Rep ${edge.requires.minReputation}`,
                  `Perf ${edge.requires.minPerformance}`,
                  edge.requires.minPoliticalCapital
                    ? `PC ${edge.requires.minPoliticalCapital}`
                    : undefined,
                  `${edge.requires.minTurnsAtLevel} cycles in post`,
                ]
                  .filter(Boolean)
                  .join(', ');
                const label = source ? t(source.titleKey) : edge.from;
                return `**${label}**${edge.sideways ? ' (across)' : ''} — ${req}`;
              })
              .join('<br>');
      const unit = post.headcount ? `${post.headcount} staff, €${post.monthlyBudget}/mo` : 'none';
      out.push(
        `| ${t(post.titleKey)} | ${post.track} | ${t(post.orgKey)} | €${post.baseSalary} | ` +
          `${post.effortPoints} | ${post.taskSlots} | ${post.monthsPerTurn} mo | ${unit} | ${routes} |`,
      );
    }
    out.push('');
  }

  /* --------------------------------------------------------------- tasks */

  out.push('## Tasks');
  out.push('');
  out.push(taskTable('Shared', allTasks.filter((task) => task.departments === 'any')));
  for (const department of departmentList) {
    const tasks = allTasks.filter(
      (task) => task.departments !== 'any' && task.departments.includes(department.id),
    );
    out.push(taskTable(t(department.nameKey), tasks));
  }

  /* --------------------------------------------------------- initiatives */

  out.push('## Initiatives');
  out.push('');
  out.push(
    '*The only content the player chooses rather than receives. Each runs look → fix → finish,',
    'with the stages gating on the flags the previous stage writes.*',
  );
  out.push('');
  for (const initiative of initiatives) {
    out.push(`### ${t(initiative.titleKey)}`);
    out.push('');
    out.push(t(initiative.descKey));
    out.push('');
    out.push(
      `*${initiative.required} points over at least ${initiative.minCycles} cycles.*`,
    );
    out.push('');
    out.push(`**Done.** ${t(initiative.completeKey)}`);
    out.push('');
    out.push(`**Dropped.** ${t(initiative.lapseKey)}`);
    out.push('');
  }

  /* -------------------------------------------------------------- country */

  out.push('## The country');
  out.push('');
  out.push('*These drift whether or not the player is looking. Names are proper nouns and are');
  out.push('not translated.*');
  out.push('');
  out.push('| Body | Kind | Founded at | Drift a month | Beat |');
  out.push('| --- | --- | ---: | ---: | --- |');
  for (const body of bodies) {
    out.push(
      `| ${body.name} | ${t(body.kindKey)} | ${body.baselineCondition} | ${body.drift} | ${body.beat} |`,
    );
  }
  out.push('');
  for (const body of bodies) {
    out.push(`**${body.name}.** ${t(body.blurbKey)}`);
    out.push('');
  }

  /* ----------------------------------------------------------- directives */

  out.push('## Standing directives');
  out.push('');
  out.push('*Neither pole of any of these is the right answer.*');
  out.push('');
  for (const directive of directives) {
    out.push(`### ${t(directive.nameKey)}`);
    out.push('');
    out.push(t(directive.blurbKey));
    out.push('');
    for (const pole of directive.poles) {
      out.push(`- **${t(pole.labelKey)}** — ${t(pole.effectKey)}`);
    }
    out.push('');
  }

  /* -------------------------------------------------------------- events */

  const byPrefix = (prefix: string) => allEvents.filter((e) => e.id.startsWith(prefix));

  out.push('## Events');
  out.push('');

  out.push('### Common pool');
  out.push('');
  out.push('*Drawn on any desk. These carry most months of most careers.*');
  out.push('');
  for (const event of byPrefix('evt.common.')) out.push(renderEvent(event));

  for (const department of departmentList) {
    out.push(`### ${t(department.nameKey)}`);
    out.push('');
    for (const event of byPrefix(`evt.${department.id}.`)) out.push(renderEvent(event));
  }

  out.push('### Milestones');
  out.push('');
  out.push('*Never drawn at random. The career system makes these eligible and at most one fires per month.*');
  out.push('');
  for (const event of byPrefix('evt.milestone.')) out.push(renderEvent(event));

  out.push('### Consequences');
  out.push('');
  out.push('*Only reachable when an earlier decision or a missed deadline schedules them.*');
  out.push('');
  for (const event of byPrefix('evt.followup.')) out.push(renderEvent(event));

  /* ------------------------------------------------------------- endings */

  out.push('## Endings');
  out.push('');
  for (const ending of ENDING_IDS) {
    const copy = endingCopy[ending];
    out.push(`### ${t(copy.titleKey)}`);
    out.push('');
    out.push(`*\`${ending}\` — ${t(copy.epitaphKey)}*`);
    out.push('');
    out.push(t(copy.bodyKey));
    out.push('');
  }
  out.push(
    'The Minister ending has three variants, chosen by how the career was built: the Reformer ' +
      '(Integrity ≥ 60), the Operator (Political capital ≥ 70), and the Survivor (neither).',
  );
  out.push('');

  return out.join('\n');
}

const target = resolve(import.meta.dirname, '../docs/narrative-script.md');
writeFileSync(target, build(), 'utf8');
console.log(`Wrote ${target}`);
