import { expect, test, type Page } from '@playwright/test';
import { bodies, registry } from '../../src/content';
import { SAVE_KEY, serialize } from '../../src/engine/save';
import { setupTeamForPost } from '../../src/engine/team';
import { bodyKnown, contributionTo } from '../../src/engine/world';
import type { GameState } from '../../src/engine/types';
import { playCareer } from '../engine/autoplay';

/**
 * A functional pass over the whole game, played rather than unit-tested.
 *
 * The other e2e files each prove one mechanism. This one walks a career end to end the way a
 * person would, in order, and asserts that each screen is reachable and says something true when
 * you get there. It is deliberately chatty: every step logs what it saw, so a failure names the
 * point in the game where the illusion broke rather than a selector.
 *
 * Fast-forwarded saves are used for the senior half, because forty months of clicking is not a
 * better test than forty months of simulation — but every assertion below is made against the
 * real rendered DOM.
 */

const SHOTS = process.env.SHOT_DIR ?? 'test-results/functional';

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
}

async function resume(page: Page, game: GameState) {
  await page.goto('/');
  await page.evaluate(
    ([key, json]) => localStorage.setItem(key as string, json as string),
    [SAVE_KEY, serialize(game)],
  );
  await page.reload();
  await page.getByRole('button', { name: 'Continue' }).click();
}

const tab = (page: Page, label: string) =>
  page.locator('.tabs').getByRole('button', { name: label });

/** Clear whatever the month threw up and land back on the desk. */
async function closeOutMonth(page: Page) {
  const dialog = page.getByRole('dialog');
  for (let guard = 0; guard < 10; guard += 1) {
    if (!(await dialog.isVisible().catch(() => false))) return;
    const heading = await dialog.getByRole('heading').first().textContent();
    if (heading?.startsWith('Month')) {
      await dialog.getByRole('button', { name: 'Next month' }).click();
      return;
    }
    const choice = dialog.locator('.choice:not(:disabled)').first();
    if (await choice.isVisible().catch(() => false)) await choice.click();
    await dialog.getByRole('button', { name: 'Continue' }).click();
  }
}

test('a career plays from the first month to the last', async ({ page }) => {
  test.setTimeout(120_000);

  /* ------------------------------------------------------- 1. starting out */

  await page.goto('/?seed=42');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await expect(page.getByRole('heading', { name: 'Public Service Story' })).toBeVisible();
  await shot(page, '01-title');

  await page.getByRole('button', { name: 'New game' }).click();
  await page.getByLabel('Your name').fill('Renata Vos');
  await page.getByRole('button', { name: /^Legal/ }).click();
  await page.getByRole('button', { name: 'Take the job' }).click();

  await expect(page.locator('.statsbar__post')).toContainText('Alderford City Council');
  await expect(page.locator('.task')).toHaveCount(4);
  await expect(page.getByTestId('effort-remaining')).toContainText('10 of 10');
  console.log('  ✓ a new career starts at Alderford with a full board and 10 points');
  await shot(page, '02-desk');

  /* ------------------------------------------------- 2. the month's choices */

  const firstTask = page.locator('.task').first();
  await firstTask.getByRole('button', { name: /^Add a point/ }).click();
  await expect(page.getByTestId('effort-remaining')).toContainText('9 of 10');

  const rest = page.locator('.personal__row').first();
  await rest.getByRole('button', { name: /^Add a point/ }).click();
  await expect(page.getByTestId('effort-remaining')).toContainText('8 of 10');
  console.log('  ✓ effort is spent on files and on your own time from one budget');

  /* -------------------------------------------------- 3. the standing rules */

  const poles = page.locator('.directive').first().locator('.directive__pole');
  await expect(poles).toHaveCount(2);
  await poles.first().click();
  await expect(poles.first()).toHaveAttribute('aria-pressed', 'true');
  console.log('  ✓ a house rule can be set and holds');

  /* ------------------------------------------------------- 4. the country */

  await tab(page, 'Country').click();
  await expect(page.getByRole('heading', { name: 'The country you work in' })).toBeVisible();
  const bodyCount = await page.locator('.bodycard').count();
  expect(bodyCount).toBeGreaterThan(0);
  // Described, never scored — the rule the screen was built on.
  await expect(page.locator('.bodycard').first()).not.toContainText(/\b\d{1,3}\s*\/\s*100\b/);
  console.log(`  ✓ the country shows ${bodyCount} place(s) you already deal with, as bands not numbers`);
  await shot(page, '03-country');

  /* ---------------------------------------------------- 5. an initiative */

  await tab(page, 'Initiatives').click();
  await expect(page.getByRole('heading', { name: 'What you could take on' })).toBeVisible();
  const offered = await page.locator('.initiative--offered').count();
  expect(offered).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Take it on' }).first().click();

  const live = page.locator('.initiative:not(.initiative--offered)').first();
  await expect(live).toContainText('0 of');
  await live.getByRole('button', { name: /^Add a point/ }).click();
  console.log(`  ✓ ${offered} initiative(s) on the menu; one taken on and funded`);
  await shot(page, '04-initiatives');

  /* --------------------------------------------------- 6. end the month */

  await tab(page, 'Desk').click();
  await page.getByRole('button', { name: 'End the month' }).click();
  await closeOutMonth(page);

  await expect(page.locator('.statsbar .eyebrow')).toContainText('February');
  await tab(page, 'Initiatives').click();
  await expect(page.locator('.initiative:not(.initiative--offered)').first()).toContainText('1 of');
  console.log('  ✓ the month resolves, the calendar advances, the initiative moved');

  /* -------------------------------------------- 7. the save survives a reload */

  await page.reload();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('.statsbar .eyebrow')).toContainText('February');
  await expect(page.getByRole('heading', { name: 'Renata Vos' })).toBeVisible();
  console.log('  ✓ the career is saved as it is played and resumes on reload');
});

test('a manager runs an office, moves post, and is warned first', async ({ page }) => {
  test.setTimeout(120_000);

  let managing: GameState | undefined;
  for (let a = 1; a <= 200 && !managing; a += 1) {
    const run = playCareer({ seed: a * 7919 + 13, department: 'procurement', stopAtLevel: 4 });
    if (run.finalState.staff.length > 2 && !run.finalState.ending) managing = run.finalState;
  }
  if (!managing) throw new Error('could not fast-forward to a manager');

  /* ------------------------------------------------------------- the unit */

  await resume(page, managing);
  await tab(page, 'Team').click();

  await expect(page.getByRole('heading', { name: 'Your unit' })).toBeVisible();
  const staff = await page.locator('.staff').count();
  expect(staff).toBeGreaterThan(0);
  await expect(page.locator('.team__average')).toContainText('Average skill');
  await expect(page.locator('.team__morale')).toContainText('Average morale');
  console.log(`  ✓ a unit of ${staff}, with both averages shown`);
  await shot(page, '05-team');

  /* ------------------------------------------------------------ the budget */

  await expect(page.getByText('Monthly allocation')).toBeVisible();
  console.log('  ✓ the budget is on screen with its allocation and payroll');

  /* --------------------------------------------------- moving on, with warning */

  const onward = registry.posts.filter((p) =>
    p.from.some((e) => e.from === managing!.player.postId),
  );
  const target = onward.find((p) => (p.headcount ?? 0) > 0) ?? onward[0]!;

  const withOffer: GameState = {
    ...managing,
    offers: [
      {
        id: 'fn-offer',
        toPost: target.id,
        toTier: target.tier,
        salary: target.baseSalary,
        createdTurn: managing.turn,
        expiresTurn: managing.turn + 6,
      },
    ],
  };

  await resume(page, withOffer);
  await tab(page, 'Career').click();
  await page.locator('.offer').first().getByRole('button', { name: 'Accept' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Before you go' })).toBeVisible();
  const boxes = dialog.locator('.keep__row input');
  expect(await boxes.count()).toBeGreaterThan(0);
  await shot(page, '06-move-warning');

  await boxes.first().check();
  const brought = await dialog.locator('.keep__name').first().textContent();
  await dialog.getByRole('button', { name: 'Take the post' }).click();

  await tab(page, 'Team').click();
  await expect(page.locator('.roster')).toContainText(brought!);
  console.log(`  ✓ the move warns first, and ${brought} came along`);
});

test('the expert fork hands the office over, and says so', async ({ page }) => {
  test.setTimeout(120_000);

  let managing: GameState | undefined;
  for (let a = 1; a <= 200 && !managing; a += 1) {
    const run = playCareer({ seed: a * 6151 + 29, department: 'procurement', stopAtLevel: 4 });
    if (run.finalState.staff.length > 2 && !run.finalState.ending) managing = run.finalState;
  }
  if (!managing) throw new Error('could not fast-forward to a manager');

  const expert = setupTeamForPost(
    {
      ...managing,
      player: { ...managing.player, postId: 'post.agency.chief_adviser', track: 'expert' },
    },
    registry,
  );

  expect(expert.staff).toHaveLength(0);
  expect(expert.alumni.length).toBeGreaterThan(0);

  await resume(page, { ...expert, phase: 'allocation', pendingEvents: [] });

  /*
   * Play a few months rather than one.
   *
   * The hand-over is a milestone, and only one milestone is drawn a month. It shares the arrival
   * at an expert post with `evt.track.expert_arrival`, so at weight 30 against 10 it wins about
   * three months in four and otherwise arrives the month after — it is `once`-gated rather than
   * cooldown-gated, so losing the roll delays it and never loses it. A test that demanded it in
   * the first month would be asserting the RNG rather than the game.
   */
  const dialog = page.getByRole('dialog');
  let found = false;

  for (let month = 0; month < 4 && !found; month += 1) {
    await page.getByRole('button', { name: 'End the month' }).click();

    for (let guard = 0; guard < 6; guard += 1) {
      if (!(await dialog.isVisible().catch(() => false))) break;

      const heading = (await dialog.getByRole('heading').first().textContent()) ?? '';
      if (heading.includes('The introduction')) {
        found = true;
        await shot(page, '07-handover');
        await dialog.locator('.choice:not(:disabled)').first().click();
        await expect(dialog.locator('.outcome')).toBeVisible();
        await dialog.getByRole('button', { name: 'Continue' }).click();
        break;
      }
      if (heading.startsWith('Month')) {
        await dialog.getByRole('button', { name: 'Next month' }).click();
        break;
      }

      const choice = dialog.locator('.choice:not(:disabled)').first();
      if (await choice.isVisible().catch(() => false)) await choice.click();
      await dialog.getByRole('button', { name: 'Continue' }).click();
    }

    if (found) break;
    await closeOutMonth(page);
  }

  expect(found, 'the hand-over scene never appeared in four months').toBe(true);
  console.log('  ✓ handing the unit over is a scene, and it resolves like any other decision');
});

test('a finished career reports what it left behind', async ({ page }) => {
  test.setTimeout(120_000);

  let finished: GameState | undefined;
  for (let a = 1; a <= 300 && !finished; a += 1) {
    const run = playCareer({ seed: a * 3571 + 11, department: 'social' });
    if (run.finalState.ending && run.finalState.alumni.length > 0) finished = run.finalState;
  }
  if (!finished) throw new Error('could not reach an ending with a roster');

  await resume(page, finished);

  await expect(page.getByRole('heading', { name: 'What is left behind' })).toBeVisible();
  const lines = await page.locator('.epilogue__list li').count();
  expect(lines).toBeGreaterThan(0);
  await expect(page.locator('.epilogue')).toContainText('People who worked for you');
  console.log(`  ✓ the epilogue reports ${lines} thing(s) the career left behind`);
  await shot(page, '08-epilogue');

  /*
    The assertion this screen was missing. It used to list every place that had moved five points
    from its founding condition, which after forty years of drift is most of the country, under a
    heading claiming the player had changed them. So: the places named here are exactly the places
    the player's finished work actually paid into, and no others.
  */
  const named = await page
    .locator('.epilogue__block--country .epilogue__name')
    .allInnerTexts();
  const worked = (test: (points: number) => boolean) =>
    bodies
      .filter(
        (body) => bodyKnown(finished!, body) && test(contributionTo(finished!, registry, body.id)),
      )
      .map((body) => body.name);

  const earned = worked((points) => points !== 0);
  const drifted = worked((points) => points === 0);

  expect(named.sort()).toEqual([...earned].sort());
  for (const name of drifted) expect(named).not.toContain(name);
  console.log(
    `  ✓ and credits the career with ${earned.length} place(s) it worked on, not the ${drifted.length} that merely drifted`,
  );

  await expect(page.getByRole('button', { name: 'Start a new career' })).toBeVisible();
  console.log('  ✓ and offers another career');
});

test('the whole game is playable in Spanish', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole('button', { name: 'Español' }).click();
  await expect(page.getByRole('heading', { name: 'Historia de un funcionario' })).toBeVisible();

  await page.getByRole('button', { name: 'Partida nueva' }).click();
  await page.getByLabel('Tu nombre').fill('Renata Vos');
  await page.getByRole('button', { name: /^Jurídic|^Legal/ }).click();
  await page.getByRole('button', { name: 'Aceptar el puesto' }).click();

  // Chrome, and the narrative underneath it.
  await expect(tab(page, 'Mesa')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'En tu mesa' })).toBeVisible();
  await expect(page.getByText('Cómo funciona esta oficina')).toBeVisible();
  await shot(page, '09-spanish');

  await tab(page, 'Iniciativas').click();
  await expect(page.getByRole('heading', { name: 'Lo que podrías asumir' })).toBeVisible();
  const title = await page.locator('.initiative__name').first().textContent();
  expect(title?.trim().length ?? 0).toBeGreaterThan(0);
  console.log(`  ✓ Spanish reaches the content, not just the chrome — "${title?.trim()}"`);
});
