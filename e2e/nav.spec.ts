import { test, expect } from '@playwright/test';

// The top nav is trimmed to these four; Certifications/Contact are still real
// sections on the page (see e2e/a11y.spec.ts), just not linked from the nav.
const SECTIONS = ['about', 'experience', 'projects', 'skills'];

test.describe('anchor navigation', () => {
  test('each nav link scrolls its section into view', async ({ page }) => {
    await page.goto('/');
    // Reduced motion disables Lenis smooth-scroll so assertions are deterministic.
    await page.getByRole('button', { name: /reduce(d)? motion/i }).click();

    for (const id of SECTIONS) {
      const link = page.locator(`nav[aria-label="Primary"] a[href="#${id}"]`);
      await expect(link).toHaveCount(1);
      await link.click();
      const section = page.locator(`#${id}`);
      await expect(section).toBeInViewport({ ratio: 0.05 });
      await expect(section).toHaveAttribute('aria-labelledby', /.+/);
    }
  });

  test('the brand link returns to the hero', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /reduce(d)? motion/i }).click();
    await page.locator('nav[aria-label="Primary"] a[href="#skills"]').click();
    await page.locator('nav[aria-label="Primary"] a[href="#hero"]').click();
    await expect(page.locator('#hero')).toBeInViewport({ ratio: 0.2 });
  });
});
