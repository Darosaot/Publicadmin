import { expect, test, type Page } from '@playwright/test';
import { registry } from '../../src/content';
import { createGame } from '../../src/engine/newGame';
import { SAVE_KEY, serialize } from '../../src/engine/save';
import type { GameState } from '../../src/engine/types';
import { playCareer } from '../engine/autoplay';
import { readFile } from 'node:fs/promises';

/**
 * The shell around the game: language chunks, save files, shared challenges, sound, the end-of-
 * career card and the full-screen ceremonies. None of it is engine logic, so what is checked here
 * is the wiring in a real browser.
 */

async function fresh(page: Page, url = '/') {
  await page.goto(url);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
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

test('Spanish is only downloaded when somebody asks for it', async ({ page }) => {
  const chunks: string[] = [];
  page.on('request', (request) => {
    if (/assets\/bundle-.*\.js/.test(request.url())) chunks.push(request.url());
  });

  await fresh(page);
  await expect(page.getByRole('heading', { name: 'Public Service Story' })).toBeVisible();
  expect(chunks, 'English readers should never fetch the Spanish chunk').toEqual([]);

  await page.getByRole('button', { name: 'Español' }).click();
  await expect(page.getByRole('heading', { name: 'Historia de un funcionario' })).toBeVisible();
  expect(chunks.length).toBe(1);
});

test('a career can be exported to a file and imported back', async ({ page }) => {
  await fresh(page, '/?seed=42');
  await page.getByRole('button', { name: 'New game' }).click();
  await page.getByLabel('Your name').fill('Renata Vos');
  await page.getByRole('button', { name: /^Procurement/ }).click();
  await page.getByRole('button', { name: 'Take the job' }).click();
  await expect(page.getByRole('heading', { name: 'Renata Vos' })).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export save' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('public-service-story-renata-vos-cycle-1.json');
  const path = await download.path();
  const saved = JSON.parse(await readFile(path, 'utf8'));
  expect(saved.player.name).toBe('Renata Vos');

  // A different browser, in effect: no save at all.
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole('button', { name: 'Continue' })).toHaveCount(0);

  await page.locator('input[type=file]').setInputFiles(path);
  await expect(page.getByRole('heading', { name: 'Renata Vos' })).toBeVisible();
  await expect(page.locator('.utility__notice')).toContainText('Career imported.');
});

test('a file that is not a save is refused and nothing is lost', async ({ page }) => {
  await fresh(page);
  await page.locator('input[type=file]').setInputFiles({
    name: 'nonsense.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"hello": "world"}'),
  });
  await expect(page.getByRole('status')).toContainText('could not be read');
  await expect(page.getByRole('button', { name: 'New game' })).toBeVisible();
});

test('the daily challenge fixes the department and labels the career', async ({ page }) => {
  await fresh(page);
  await page.getByRole('button', { name: 'New game' }).click();
  await page.getByRole('button', { name: 'Daily challenge', exact: true }).click();

  // Exactly one department can be chosen: the day's.
  await expect(page.locator('.deptcard:not(:disabled)')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Take the job' })).toBeEnabled();
  await page.getByLabel('Your name').fill('Ada Daily');
  await page.getByRole('button', { name: 'Take the job' }).click();
  await expect(page.getByRole('heading', { name: 'Ada Daily' })).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export save' }).click(),
  ]);
  const saved = JSON.parse(await readFile((await download.path())!, 'utf8'));
  expect(saved.challenge).toMatch(/^daily:\d{4}-\d{2}-\d{2}$/);
});

test('sound is off until asked for, and the choice is remembered', async ({ page }) => {
  await fresh(page);
  const toggle = page.getByRole('button', { name: /^Sound:/ });
  await expect(toggle).toHaveText('Sound: off');

  await toggle.click();
  await expect(toggle).toHaveText('Sound: on');

  await page.reload();
  await expect(page.getByRole('button', { name: /^Sound:/ })).toHaveText('Sound: on');
  await page.getByRole('button', { name: /^Sound:/ }).click();
  await expect(page.getByRole('button', { name: /^Sound:/ })).toHaveText('Sound: off');
});

test('taking a better post is a ceremony, and a reload does not replay it', async ({ page }) => {
  const game = createGame({ name: 'Ada Fixture', department: 'procurement', seed: 5 }, registry);
  const post = registry.posts.find((p) => p.tier === 2 && p.track === 'line')!;
  await resume(page, {
    ...game,
    offers: [
      {
        id: 'offer-1',
        toPost: post.id,
        toTier: 2,
        salary: post.baseSalary,
        createdTurn: game.turn,
        expiresTurn: game.turn + 5,
      },
    ],
  });

  await page.locator('.tabs').getByRole('button', { name: 'Career' }).click();
  await page.getByRole('button', { name: 'Accept' }).first().click();
  // No unit to leave behind at this desk, so there is no hand-over dialogue to confirm.

  const stage = page.locator('.ceremony');
  await expect(stage).toBeVisible();
  await expect(stage.getByRole('heading')).toContainText('Senior Officer');
  await stage.getByRole('button', { name: 'Continue' }).click();
  await expect(stage).toHaveCount(0);

  await page.reload();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('.ceremony')).toHaveCount(0);
});

test('a finished career offers a card to copy or download', async ({ page, context }) => {
  test.setTimeout(120_000);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  let finished: GameState | undefined;
  for (let a = 1; a <= 100 && !finished; a += 1) {
    const run = playCareer({ seed: a * 3571 + 11, department: 'procurement' });
    if (run.finalState.ending) finished = run.finalState;
  }
  if (!finished) throw new Error('could not reach an ending');

  await resume(page, finished);

  await expect(page.getByRole('heading', { name: 'Share this career' })).toBeVisible();
  await expect(page.locator('.summary__canvas')).toBeVisible();

  await page.getByRole('button', { name: 'Copy as text' }).click();
  await expect(page.locator('.summary__status')).toContainText('Copied.');
  const text = await page.evaluate(() =>
    (navigator as unknown as { clipboard: { readText(): Promise<string> } }).clipboard.readText(),
  );
  expect(text).toContain(finished.player.name);
  expect(text).toContain(`?seed=${finished.seed}`);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download image' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('public-service-story.png');
});
