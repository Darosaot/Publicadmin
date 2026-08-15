import { expect, test } from '@playwright/test';

/**
 * The language switcher is chrome, not engine — its whole job is picking which dictionary
 * `translate()` reads from. What needs covering here is the wiring: that clicking it actually
 * changes what's on screen, that the choice survives a reload, and that it reaches all the way
 * into content strings (department names), not just the interface strings around them.
 */

test('switching to Spanish changes the title screen and survives a reload', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await expect(page.getByRole('heading', { name: 'Public Service Story' })).toBeVisible();

  await page.getByRole('button', { name: 'Español' }).click();

  await expect(page.getByRole('heading', { name: 'Historia de un funcionario' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Partida nueva' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Historia de un funcionario' })).toBeVisible();
});

test('Spanish reaches content strings, not just interface chrome', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole('button', { name: 'Español' }).click();
  await page.getByRole('button', { name: 'Partida nueva' }).click();

  await expect(page.getByRole('heading', { name: 'Jurídico' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Servicios sociales' })).toBeVisible();
  await expect(page.getByText('Puesto inicial')).toBeVisible();
});

test('switching back to English is immediate and complete', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole('button', { name: 'Español' }).click();
  await expect(page.getByRole('button', { name: 'English' })).toBeVisible();
  await page.getByRole('button', { name: 'English' }).click();

  await expect(page.getByRole('heading', { name: 'Public Service Story' })).toBeVisible();
});
