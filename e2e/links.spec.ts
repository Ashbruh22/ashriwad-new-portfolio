import { test, expect } from '@playwright/test';

test.describe('external links', () => {
  test('open in a new tab with safe rel and an accessible name', async ({ page }) => {
    await page.goto('/');

    const externals = page.locator('a[target="_blank"]');
    const count = await externals.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i += 1) {
      const link = externals.nth(i);
      const rel = (await link.getAttribute('rel')) ?? '';
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');

      const name =
        (await link.getAttribute('aria-label')) ??
        ((await link.textContent()) ?? '').trim();
      expect(name.length, `link #${i} needs an accessible name`).toBeGreaterThan(0);
    }
  });

  test('the resume download link is present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[download]').first()).toHaveAttribute('href', /\.pdf$/);
  });
});
