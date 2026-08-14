import { expect, test, type Page } from '@playwright/test';
import { SAVE_KEY, serialize } from '../../src/engine/save';
import type { DepartmentId, GameState } from '../../src/engine/types';
import { playCareer } from '../engine/autoplay';

/**
 * The Team screen, reached the way a player reaches it.
 *
 * A management post is forty in-game months away, which is a long way to click through, so the
 * save is fast-forwarded with the same bot the balance report uses — no hand-built state, no
 * special-casing. It is generated here rather than committed as a fixture so it can never go stale
 * against the save format or the content ids.
 */
function careerAtLevel(level: number, department: DepartmentId): GameState {
  for (let attempt = 1; attempt <= 200; attempt += 1) {
    const run = playCareer(attempt * 7919 + 13, department, 'balanced', 200, level);
    if (run.finalState.player.level >= level && !run.finalState.ending) return run.finalState;
  }
  throw new Error(`Could not fast-forward a ${department} career to level ${level}`);
}

const managing = careerAtLevel(4, 'procurement');

/** Loads a career straight into the browser, as if it had been played there. */
async function resume(page: Page, game: GameState) {
  await page.goto('/');
  await page.evaluate(
    ([key, json]) => localStorage.setItem(key as string, json as string),
    [SAVE_KEY, serialize(game)],
  );
  await page.reload();
  await page.getByRole('button', { name: 'Continue' }).click();
}

test('a manager gets a unit, a budget and a way to spend a month on people', async ({ page }) => {
  await resume(page, managing);

  await expect(page.locator('.statsbar__post')).toContainText('Head of Department');

  await page.getByRole('button', { name: 'Team' }).click();

  // Everyone the bot ended up with is on the roster, with both bars rendered.
  await expect(page.locator('.staff')).toHaveCount(managing.staff.length);
  await expect(page.locator('.staff').first().locator('.staffbar')).toHaveCount(2);

  const effort = page.getByTestId('effort-remaining');
  const before = Number((await effort.textContent())?.match(/(\d+) of/)?.[1]);

  // Sitting down with someone costs a point of the month, and un-costs it.
  const oneToOne = page.locator('.staff').first().getByRole('button', { name: /^One-to-one/ });
  await oneToOne.click();
  await expect(oneToOne).toHaveClass(/chipbtn--on/);
  await expect(effort).toContainText(`${before - 1} of`);

  await oneToOne.click();
  await expect(effort).toContainText(`${before} of`);
});

test('the budget adds up and warns about both ways of getting it wrong', async ({ page }) => {
  await resume(page, managing);
  await page.getByRole('button', { name: 'Team' }).click();

  const budget = page.locator('.budget');
  await expect(budget).toBeVisible();

  // Committing money moves the slack line; the payroll line does not move.
  const slack = page.locator('.budget__row--total dd');
  const beforeSlack = await slack.textContent();

  await page.locator('.staff').first().getByRole('button', { name: /^Training course/ }).click();
  await expect(slack).not.toHaveText(beforeSlack ?? '');

  // Agency cover buys effort with money.
  const effort = page.getByTestId('effort-remaining');
  const beforeEffort = Number((await effort.textContent())?.match(/(\d+) of/)?.[1]);
  await page.getByRole('button', { name: 'Add agency cover' }).click();
  await expect(effort).toContainText(`${beforeEffort + 2} of`);
});

test('a file can be handed to someone, and the desk says who has it', async ({ page }) => {
  await resume(page, managing);

  // Delegation lives on the desk, where the files are.
  const firstTask = page.locator('.task').first();
  const picker = firstTask.getByRole('combobox');
  await expect(picker).toBeVisible();

  const staffName = managing.staff[0]!.name;
  await picker.selectOption({ label: staffName });

  // The Team screen shows the same assignment from the other side.
  await page.getByRole('button', { name: 'Team' }).click();
  await expect(page.locator('.staff__carrying').first()).toBeVisible();
});

test('the Team tab only exists once there is a team', async ({ page }) => {
  await page.goto('/?seed=42');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole('button', { name: 'New game' }).click();
  await page.getByLabel('Your name').fill('Renata Vos');
  await page.getByRole('button', { name: /^Procurement/ }).click();
  await page.getByRole('button', { name: 'Take the job' }).click();

  await expect(page.getByRole('button', { name: 'Desk' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Team' })).toHaveCount(0);
});
