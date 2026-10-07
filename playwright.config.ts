import { defineConfig } from '@playwright/test';
const baseURL=process.env.SITE_TEST_URL ?? 'http://127.0.0.1:4321';
export default defineConfig({
  testDir: './tests/browser',
  // Each audit visits every generated page; leave room for the content library to grow.
  timeout: 120_000,
  use: { baseURL, browserName: 'chromium', ...(process.env.PLAYWRIGHT_CHANNEL ? {channel: process.env.PLAYWRIGHT_CHANNEL} : {}) },
  ...(process.env.SITE_TEST_URL ? {} : {webServer: { command: 'npm run preview -- --ignore-lock', url: baseURL, reuseExistingServer: !process.env.CI }}),
});
