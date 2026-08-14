/**
 * Prints a balance report from simulated careers.
 *
 *   npm run balance
 *
 * Use it after changing anything in `src/engine/constants.ts`. What to look for: careers should
 * spread across the ladder rather than piling at one level, every ending should be reachable, and
 * nothing should dominate.
 */

import { DEPARTMENT_IDS } from '../src/engine/types';
import { playMany, summarise, type RunResult } from '../tests/engine/autoplay';

const seeds = Array.from({ length: 40 }, (_, i) => i * 7919 + 13);
const results = playMany(seeds, DEPARTMENT_IDS);
const summary = summarise(results);

const pct = (n: number) => `${((n / summary.runs) * 100).toFixed(1)}%`;
const round = (n: number) => n.toFixed(1);

console.log(`\n${summary.runs} simulated careers across ${DEPARTMENT_IDS.length} departments\n`);

console.log('Endings');
for (const [ending, count] of Object.entries(summary.byEnding).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${ending.padEnd(22)} ${String(count).padStart(4)}  ${pct(count)}`);
}

console.log('\nLevel reached');
for (const level of [1, 2, 3, 4, 5]) {
  const count = summary.byLevel[level] ?? 0;
  console.log(`  level ${level}              ${String(count).padStart(4)}  ${pct(count)}`);
}

console.log('\nAverages');
console.log(`  cycles played          ${round(summary.meanTurns)}`);
console.log(`  years of service       ${round(summary.meanYears)}`);
console.log(`  level                  ${round(summary.meanLevel)}`);
console.log(`  reputation             ${round(summary.meanReputation)}`);
console.log(`  political capital      ${round(summary.meanPoliticalCapital)}`);
console.log(`  integrity              ${round(summary.meanIntegrity)}`);
console.log(`  stress                 ${round(summary.meanStress)}`);
console.log(`  salary                 €${Math.round(summary.meanSalary)}`);
console.log(`  tasks finished on time ${(summary.completionRate * 100).toFixed(1)}%`);

console.log('\nBy department');
for (const department of DEPARTMENT_IDS) {
  const subset: RunResult[] = results.filter((r) => r.department === department);
  const sub = summarise(subset);
  console.log(
    `  ${department.padEnd(12)} level ${round(sub.meanLevel)}  ` +
      `rep ${round(sub.meanReputation)}  stress ${round(sub.meanStress)}  ` +
      `integrity ${round(sub.meanIntegrity)}  years ${round(sub.meanYears)}`,
  );
}

// The balanced bot avoids the two endings it is designed to avoid, so they are checked against
// strategies that pursue them. An ending nothing can reach is a content bug.
console.log('\nReachability of the endings the balanced bot avoids');
for (const strategy of ['ruthless', 'reckless'] as const) {
  const runs = playMany(seeds.slice(0, 12), DEPARTMENT_IDS, strategy);
  const sub = summarise(runs);
  const endings = Object.entries(sub.byEnding)
    .sort((a, b) => b[1] - a[1])
    .map(([ending, count]) => `${ending} ${count}`)
    .join(', ');
  console.log(
    `  ${strategy.padEnd(9)} integrity ${round(sub.meanIntegrity)}  ` +
      `stress ${round(sub.meanStress)}  years ${round(sub.meanYears)}`,
  );
  console.log(`            ${endings}`);
}
console.log('');
