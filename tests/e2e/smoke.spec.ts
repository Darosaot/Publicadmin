import { expect, test, type Page } from '@playwright/test';

/**
 * Plays a handful of real months in a browser.
 *
 * The engine has its own unit tests; what this covers is the wiring — that the screens render,
 * that clicking a stepper reaches the reducer, that events block the turn until they are decided,
 * and that a career survives a page reload.
 */

/** Starts a fresh career with a fixed seed so runs are reproducible. */
async function startCareer(page: Page, department = 'Procurement') {
  await page.goto('/?seed=42');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole('button', { name: 'New game' }).click();
  await page.getByLabel('Your name').fill('Renata Vos');
  await page.getByRole('button', { name: new RegExp(`^${department}`) }).click();
  await page.getByRole('button', { name: 'Take the job' }).click();

  await expect(page.getByRole('heading', { name: 'Renata Vos' })).toBeVisible();
}

/** Resolves any events blocking the month, then returns to the desk. */
async function clearEvents(page: Page) {
  const dialog = page.getByRole('dialog');

  for (let guard = 0; guard < 8; guard += 1) {
    if (!(await dialog.isVisible().catch(() => false))) return;

    const heading = await dialog.getByRole('heading').first().textContent();
    if (heading?.startsWith('Month')) return; // the turn report, not an event

    const choice = dialog.locator('.choice:not(:disabled)').first();
    if (await choice.isVisible().catch(() => false)) {
      await choice.click();
    }
    await dialog.getByRole('button', { name: 'Continue' }).click();
  }
}

async function playMonth(page: Page) {
  // Put a point into the first task so the month is not entirely idle.
  const firstAdd = page.locator('.board .stepper__btn').nth(1);
  if (await firstAdd.isEnabled().catch(() => false)) await firstAdd.click();

  await page.getByRole('button', { name: 'End the month' }).click();
  await clearEvents(page);

  const report = page.getByRole('dialog');
  if (await report.isVisible().catch(() => false)) {
    await report.getByRole('button', { name: 'Next month' }).click();
  }
}

test('a career can be started, played and resumed', async ({ page }) => {
  await startCareer(page);

  await expect(page.locator('.statsbar__post')).toHaveText(
    'Administrative Officer · Alderford City Council',
  );
  // Four slots at the starting post, and none of the budget spent yet.
  await expect(page.locator('.task')).toHaveCount(4);
  await expect(page.getByTestId('effort-remaining')).toContainText('10 of 10');

  // A cycle at a junior desk is one month, so the calendar advances a month at a time here. It
  // will not later: a directorate turns over half a year at a time.
  const months = ['January', 'February', 'March', 'April', 'May', 'June'];
  for (let cycle = 0; cycle < 5; cycle += 1) {
    await expect(page.locator('.statsbar .eyebrow')).toHaveText(`${months[cycle]}, year 1`);
    await playMonth(page);
  }

  await expect(page.locator('.statsbar .eyebrow')).toHaveText('June, year 1');

  // The career is saved as it is played, so a reload must resume the same cycle.
  await page.reload();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('.statsbar .eyebrow')).toHaveText('June, year 1');
  await expect(page.getByRole('heading', { name: 'Renata Vos' })).toBeVisible();
});

test('effort points are spent and cannot be overspent', async ({ page }) => {
  await startCareer(page, 'Legal');

  const remaining = page.getByTestId('effort-remaining');
  const firstTask = page.locator('.task').first();

  await firstTask.getByRole('button', { name: /^Add a point/ }).click();
  await expect(remaining).toContainText('9 of 10');

  await firstTask.getByRole('button', { name: /^Take a point off/ }).click();
  await expect(remaining).toContainText('10 of 10');

  // Spend the whole budget on rest, then every add button must be disabled.
  const restAdd = page.locator('.personal__row').first().getByRole('button', { name: /^Add a point/ });
  for (let i = 0; i < 10; i += 1) await restAdd.click();

  await expect(remaining).toContainText('0 of 10');
  await expect(restAdd).toBeDisabled();
  await expect(firstTask.getByRole('button', { name: /^Add a point/ })).toBeDisabled();

  // Overtime buys three more points.
  await page.getByRole('checkbox').check();
  await expect(remaining).toContainText('3 of 13');
});

test('an event blocks the month until it is decided', async ({ page }) => {
  await startCareer(page, 'Finance');
  await page.getByRole('button', { name: 'End the month' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  const heading = await dialog.getByRole('heading').first().textContent();
  test.skip(heading?.startsWith('Month') ?? false, 'no event fired on this seed');

  // Before a decision there is no way forward; after one, there is.
  await expect(dialog.getByRole('button', { name: 'Continue' })).toHaveCount(0);
  await dialog.locator('.choice:not(:disabled)').first().click();
  await expect(dialog.getByRole('button', { name: 'Continue' })).toBeVisible();
  await expect(dialog.locator('.outcome')).toBeVisible();
});

test('the career screen shows the ladder and what the next post needs', async ({ page }) => {
  await startCareer(page, 'Policy');

  await page.getByRole('button', { name: 'Career' }).click();
  await expect(page.getByRole('heading', { name: 'The ladder' })).toBeVisible();
  await expect(page.locator('.rung')).toHaveCount(5);
  await expect(page.locator('.rung--current .rung__title')).toHaveText('Administrative Officer');
  await expect(page.getByText('No offers at the moment.', { exact: false })).toBeVisible();
  await expect(page.locator('.requirement')).toHaveCount(3);

  await page.getByRole('button', { name: 'Desk' }).click();
  await expect(page.locator('.board')).toBeVisible();
});
