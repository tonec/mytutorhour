import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

// Test runner only: makes NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY available to
// E2E fixtures. App code must never read SUPABASE_SERVICE_ROLE_KEY.
if (existsSync('.env.local')) process.loadEnvFile('.env.local');

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL,
    testIdAttribute: 'data-testid',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    // Mobile-first: 375px is the narrowest width core flows must support
    { name: 'mobile', use: { ...devices['iPhone SE (3rd gen)'] } },
  ],
  // Start the dev server before the tests; reuse one that's already running locally
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
