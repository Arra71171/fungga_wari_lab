import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration for Fungga Wari Lab monorepo.
 * - web: public reader at http://localhost:3001
 * - dashboard: creator studio at http://localhost:3000
 *
 * Run: pnpm exec playwright test
 * UI:  pnpm exec playwright test --ui
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
  ],
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "web-chromium",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3001",
      },
      testMatch: "e2e/web/**/*.spec.ts",
    },
    {
      name: "dashboard-chromium",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3000",
      },
      testMatch: "e2e/dashboard/**/*.spec.ts",
    },
  ],
});
