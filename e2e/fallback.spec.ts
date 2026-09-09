import { test, expect } from '@playwright/test';

test.describe('hero / background fallback path', () => {
  test('with WebGL unavailable, the page renders and content is intact', async ({ page }) => {
    await page.addInitScript(() => {
      const proto = HTMLCanvasElement.prototype as unknown as {
        getContext: (this: HTMLCanvasElement, type: string, ...rest: unknown[]) => unknown;
      };
      const original = proto.getContext;
      proto.getContext = function (type: string, ...rest: unknown[]) {
        if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null;
        return original.call(this, type, ...rest);
      };
    });

    await page.goto('/');
    // the WebGL orb degrades to its static fallback; content is untouched
    await expect(page.locator('h1')).toHaveText(/Ashriwad Behera/);
    await expect(page.locator('#contact')).toHaveCount(1);
    await expect(page.locator('nav[aria-label="Primary"]')).toHaveCount(1);
  });

  test('reduce motion removes every animated canvas layer', async ({ page }) => {
    await page.goto('/');

    // the interactive layers (orb + dot field) mount for a motion-OK visitor
    await expect(page.locator('canvas').first()).toBeAttached();
    // ...and every canvas is hidden from assistive tech
    for (const c of await page.locator('canvas').all()) {
      await expect(
        c.locator('xpath=ancestor-or-self::*[@aria-hidden="true"]').first(),
      ).toHaveCount(1);
    }

    const toggle = page.getByRole('button', { name: /reduce(d)? motion/i });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');

    await expect(page.locator('canvas')).toHaveCount(0);

    // Skills renders as a static list of chips in every motion mode.
    await page.locator('#skills').scrollIntoViewIfNeeded();
    await expect(page.locator('#skills .animate-marquee, #skills .animate-marquee-reverse')).toHaveCount(0);
    await expect(page.locator('#skills')).toContainText('Python');
  });
});
