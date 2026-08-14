/**
 * Prints a save file for a career that has already reached a given level.
 *
 * Reaching a management post legitimately takes forty in-game months, which is a long way to
 * click through for a screenshot or a manual check of the Team screen. This fast-forwards using
 * the same bot the balance report uses — no special-casing, no hand-built state — and emits the
 * JSON the game writes to localStorage, so what you load is what a played career would produce.
 *
 *   npx vite-node scripts/make-save.ts 4 procurement > save.json
 */

import { serialize } from '../src/engine/save';
import { DEPARTMENT_IDS, type DepartmentId } from '../src/engine/types';
import { playCareer } from '../tests/engine/autoplay';

const targetLevel = Number(process.argv[2] ?? 3);
const department = (process.argv[3] ?? 'procurement') as DepartmentId;

if (!DEPARTMENT_IDS.includes(department)) {
  console.error(`Unknown department "${department}". One of: ${DEPARTMENT_IDS.join(', ')}`);
  process.exit(1);
}

for (let attempt = 1; attempt <= 120; attempt += 1) {
  const run = playCareer(attempt * 7919 + 13, department, 'balanced', 200, targetLevel);
  const game = run.finalState;

  if (game.player.level >= targetLevel && !game.ending) {
    console.error(
      `Reached level ${game.player.level} at month ${game.turn} with ${game.staff.length} staff ` +
        `(seed ${run.seed}).`,
    );
    console.log(serialize(game));
    process.exit(0);
  }
}

console.error(`Could not reach level ${targetLevel} as ${department} in 120 attempts.`);
process.exit(1);
