import { test, expect } from '@playwright/test';

test.describe('accessibility structure', () => {
  test('exactly one h1, and it is the name', async ({ page }) => {
    await page.goto('/');
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText(/Ashriwad Behera/);
  });

  test('landmarks and section headings are present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header[role="banner"]')).toHaveCount(1);
    await expect(page.locator('nav[aria-label="Primary"]')).toHaveCount(1);
    await expect(page.locator('main#main')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);

    for (const id of ['about', 'experience', 'featured-projects', 'projects', 'skills', 'certifications', 'contact']) {
      const labelledby = await page.locator(`#${id}`).getAttribute('aria-labelledby');
      expect(labelledby, `#${id} aria-labelledby`).toBeTruthy();
      await expect(page.locator(`#${labelledby}`)).toHaveCount(1);
    }
  });

  test('skip link is the first focusable element and targets #main', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toHaveAttribute('href', '#main');
    await expect(focused).toHaveClass(/skip-link/);
  });

  test('every decorative canvas is hidden from assistive tech', async ({ page }) => {
    await page.goto('/');
    const canvases = await page.locator('canvas').all();
    for (const c of canvases) {
      await expect(c.locator('xpath=ancestor-or-self::*[@aria-hidden="true"]').first()).toHaveCount(1);
    }
  });
});
