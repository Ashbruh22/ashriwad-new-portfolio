import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke tests for the things most likely to regress on a scroll-driven 3D site:
 * anchor navigation, external-link hygiene, accessibility landmarks/keyboard,
 * and the no-WebGL / reduced-motion fallback path (PROJECT_REQUIREMENTS.md §11).
 *
 * Run against a dev server if one is already up on :3000, otherwise start one.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
