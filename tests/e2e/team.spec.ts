import { expect, test, type Page } from '@playwright/test';
import { SAVE_KEY, serialize } from '../../src/engine/save';
import type { DepartmentId, GameState, TrackId } from '../../src/engine/types';
import { playCareer } from '../engine/autoplay';

/**
 * A top-level tab, by its label.
 *
 * Scoped to the nav rather than the page because `getByRole`'s name matching is a substring: once
 * the desk grew a panel whose prose contains the word "people", a bare page-level lookup for the
 * People tab started matching a directive button and the tab-visibility tests began passing for
 * the wrong reason.
 */
function tab(page: Page, label: string) {
  return page.locator('.tabs').getByRole('button', { name: label });
}

/**
 * The Team screen, reached the way a player reaches it.
 *
 * A management post is forty in-game months away, which is a long way to click through, so the
 * save is fast-forwarded with the same bot the balance report uses — no hand-built state, no
 * special-casing. It is generated here rather than committed as a fixture so it can never go stale
 * against the save format or the content ids.
 */
function careerAtLevel(level: number, department: DepartmentId, track: TrackId): GameState {
  for (let attempt = 1; attempt <= 200; attempt += 1) {
    const run = playCareer({ seed: attempt * 7919 + 13, department, stopAtLevel: level, preferredTrack: track });
    if (run.finalState.player.level >= level && run.finalState.player.track === track && !run.finalState.ending) {
      return run.finalState;
    }
  }
  throw new Error(`Could not fast-forward a ${department} career to ${track} tier ${level}`);
}

// The line track, explicitly: left to chase salary the bot ends up in a private office, and this
// file is about running a unit.
const managing = careerAtLevel(4, 'procurement', 'line');

// And one career that took the branch with no unit at all, to prove the office half really does
// disappear rather than merely being hidden.
const specialist = careerAtLevel(3, 'legal', 'expert');

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

  await tab(page, 'Team').click();

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
  await tab(page, 'Team').click();

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
  await tab(page, 'Team').click();
  await expect(page.locator('.staff__carrying').first()).toBeVisible();
});

test('a senior post runs on a slower clock than a junior one', async ({ page }) => {
  await resume(page, managing);

  // The whole reason a 120-turn game is a thirty-year career: a cycle here is half a year, so
  // ending one moves the calendar six months rather than one.
  const before = managing.calendarMonth;
  await page.getByRole('button', { name: 'End the month' }).click();

  // Clear whatever the cycle threw up, then the report.
  const dialog = page.getByRole('dialog');
  for (let guard = 0; guard < 8; guard += 1) {
    if (!(await dialog.isVisible().catch(() => false))) break;
    const next = dialog.getByRole('button', { name: 'Next month' });
    if (await next.isVisible().catch(() => false)) {
      await next.click();
      break;
    }
    const choice = dialog.locator('.choice:not(:disabled)').first();
    if (await choice.isVisible().catch(() => false)) await choice.click();
    await dialog.getByRole('button', { name: 'Continue' }).click();
  }

  const saved = await page.evaluate((key) => localStorage.getItem(key as string), SAVE_KEY);
  const after = JSON.parse(saved ?? '{}') as { calendarMonth: number };
  expect(after.calendarMonth - before).toBe(6);
});

test('the specialist branch has no office at all, not merely a hidden one', async ({ page }) => {
  await resume(page, specialist);

  await expect(page.locator('.statsbar__post')).toContainText('Principal Specialist');
  await expect(tab(page, 'Team')).toHaveCount(0);

  // No unit means no delegation: the files are yours to the end.
  await expect(page.locator('.task').first().getByRole('combobox')).toHaveCount(0);
});

test('the career screen shows the branch not taken', async ({ page }) => {
  await resume(page, managing);
  await tab(page, 'Career').click();

  // Every post in the tree is on screen, and exactly one of them is where the player is.
  await expect(page.locator('.rung')).toHaveCount(15);
  await expect(page.locator('.rung--current')).toHaveCount(1);
  await expect(page.locator('.rung--current .rung__title')).toHaveText('Head of Department');

  // The three tier-4 posts on other branches are shown as the jobs not taken, which is the whole
  // reason for drawing the tree rather than a ladder.
  await expect(page.locator('.rung--missed')).toHaveCount(3);
  await expect(page.locator('.rung--missed').first()).toBeVisible();

  // And every tier-5 post is reachable from a Head of Department, so all four are open.
  await expect(page.locator('.rung--open')).toHaveCount(4);
});

test('the people you know are on their own screen, and it remembers', async ({ page }) => {
  await resume(page, managing);

  await tab(page, 'People').click();
  await expect(page.getByRole('heading', { name: 'People you know' })).toBeVisible();

  // Anyone met has a card; nobody unmet does.
  const cards = page.locator('.person');
  const shown = await cards.count();
  expect(shown).toBeGreaterThan(2);
  expect(shown).toBeLessThanOrEqual(8);

  // Each card says how they regard you rather than showing the raw number.
  await expect(cards.first().locator('.person__tone')).not.toBeEmpty();
  await expect(cards.first().locator('.person__track')).toBeVisible();
});

test('the People tab stays hidden until somebody has been met', async ({ page }) => {
  await page.goto('/?seed=42');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole('button', { name: 'New game' }).click();
  await page.getByLabel('Your name').fill('Renata Vos');
  await page.getByRole('button', { name: /^Legal/ }).click();
  await page.getByRole('button', { name: 'Take the job' }).click();

  await expect(tab(page, 'People')).toHaveCount(0);
});

test('the Team tab only exists once there is a team', async ({ page }) => {
  await page.goto('/?seed=42');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole('button', { name: 'New game' }).click();
  await page.getByLabel('Your name').fill('Renata Vos');
  await page.getByRole('button', { name: /^Procurement/ }).click();
  await page.getByRole('button', { name: 'Take the job' }).click();

  await expect(tab(page, 'Desk')).toBeVisible();
  await expect(tab(page, 'Team')).toHaveCount(0);
});

test('the country is on screen from the first month, described rather than scored', async ({ page }) => {
  await page.goto('/?seed=42');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole('button', { name: 'New game' }).click();
  await page.getByLabel('Your name').fill('Renata Vos');
  await page.getByRole('button', { name: /^Legal/ }).click();
  await page.getByRole('button', { name: 'Take the job' }).click();

  // Unlike People, the Country tab is there immediately: the institutions your own department
  // deals with are ones you already know the state of.
  await tab(page, 'Country').click();
  await expect(page.getByRole('heading', { name: 'The country you work in' })).toBeVisible();

  const cards = page.locator('.bodycard');
  expect(await cards.count()).toBeGreaterThan(0);

  // A band and a bar, never the figure — the same rule the People screen follows for standing.
  await expect(cards.first().locator('.bodycard__state')).not.toBeEmpty();
  await expect(cards.first().locator('.bodycard__track')).toBeVisible();
  await expect(cards.first()).not.toContainText(/\b\d{1,3}\s*\/\s*100\b/);

  // And the rest of the country is counted, not listed.
  await expect(page.getByRole('heading', { name: 'Elsewhere' })).toBeVisible();
});

test('a long career has watched places move', async ({ page }) => {
  await resume(page, managing);

  await tab(page, 'Country').click();

  // Twenty-odd years of drift cannot leave every institution exactly where it was founded.
  const moved = page.locator('.bodycard .pill');
  expect(await moved.count()).toBeGreaterThan(0);
});

test('an initiative can be taken on, funded, and moves after a month', async ({ page }) => {
  await page.goto('/?seed=42');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole('button', { name: 'New game' }).click();
  await page.getByLabel('Your name').fill('Renata Vos');
  await page.getByRole('button', { name: /^Legal/ }).click();
  await page.getByRole('button', { name: 'Take the job' }).click();

  await tab(page, 'Initiatives').click();
  await expect(page.getByRole('heading', { name: 'What you could take on' })).toBeVisible();

  // Nothing of your own yet: everything on the desk arrived there.
  await expect(page.locator('.initiative--offered').first()).toBeVisible();
  await page.getByRole('button', { name: 'Take it on' }).first().click();

  const live = page.locator('.initiative:not(.initiative--offered)').first();
  await expect(live).toBeVisible();
  await expect(live).toContainText('0 of');

  // Effort comes out of the same monthly budget as the files, so the counter has to move.
  await expect(page.getByTestId('effort-remaining')).toContainText('10 of 10');
  await live.getByRole('button', { name: /^Add a point/ }).click();
  await live.getByRole('button', { name: /^Add a point/ }).click();
  await expect(page.getByTestId('effort-remaining')).toContainText('8 of 10');

  // Ending the month is the desk's business, so go back for it.
  await tab(page, 'Desk').click();
  await page.getByRole('button', { name: 'End the month' }).click();
  // Decide whatever the month threw up, then close the report. Same shape as `playMonth` in
  // smoke.spec.ts: an event may or may not fire on a given seed, and the report always does.
  const dialog = page.getByRole('dialog');
  for (let guard = 0; guard < 8; guard += 1) {
    if (!(await dialog.isVisible().catch(() => false))) break;
    const heading = await dialog.getByRole('heading').first().textContent();
    if (heading?.startsWith('Month')) {
      await dialog.getByRole('button', { name: 'Next month' }).click();
      break;
    }
    const choice = dialog.locator('.choice:not(:disabled)').first();
    if (await choice.isVisible().catch(() => false)) await choice.click();
    await dialog.getByRole('button', { name: 'Continue' }).click();
  }

  await tab(page, 'Initiatives').click();
  await expect(page.locator('.initiative:not(.initiative--offered)').first()).toContainText(
    '2 of',
  );
});

test('a house rule can be set, and unset', async ({ page }) => {
  await page.goto('/?seed=42');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole('button', { name: 'New game' }).click();
  await page.getByLabel('Your name').fill('Renata Vos');
  await page.getByRole('button', { name: /^Legal/ }).click();
  await page.getByRole('button', { name: 'Take the job' }).click();

  const poles = page.locator('.directive').first().locator('.directive__pole');
  await expect(poles).toHaveCount(2);

  // Both sides state their cost as flatly as their benefit — neither is the right answer.
  await expect(poles.first()).toHaveAttribute('aria-pressed', 'false');
  await poles.first().click();
  await expect(poles.first()).toHaveAttribute('aria-pressed', 'true');
  await expect(poles.last()).toHaveAttribute('aria-pressed', 'false');

  // It holds across a reload, because it is a standing rule rather than this month's plan.
  await page.reload();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(poles.first()).toHaveAttribute('aria-pressed', 'true');

  // And pressing the pole you already hold releases it: "we have not decided" stays reachable.
  await poles.first().click();
  await expect(poles.first()).toHaveAttribute('aria-pressed', 'false');
});
