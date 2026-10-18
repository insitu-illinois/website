import { defineConfig } from '@playwright/test';
const baseURL=process.env.SITE_TEST_URL ?? 'http://127.0.0.1:4321';
export default defineConfig({
  testDir: './tests/browser',
  // Each audit visits every generated page; leave room for the content library to grow.
  timeout: 120_000,
  // The hosted runner is slow and the pages animate, so allow a retry before a timing slip blocks a deploy.
  retries: process.env.CI ? 2 : 0,
  use: { baseURL, browserName: 'chromium', ...(process.env.PLAYWRIGHT_CHANNEL ? {channel: process.env.PLAYWRIGHT_CHANNEL} : {}) },
  ...(process.env.SITE_TEST_URL ? {} : {webServer: { command: 'npm run preview -- --ignore-lock', url: baseURL, reuseExistingServer: !process.env.CI }}),
});
