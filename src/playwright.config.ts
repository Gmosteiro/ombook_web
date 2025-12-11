import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  reporter: [['list'], ['allure-playwright']],
  use: {
    browserName: 'chromium',
    headless: true,
  },
});