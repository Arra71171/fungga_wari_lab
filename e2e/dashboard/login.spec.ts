import { test, expect } from "@playwright/test";

/**
 * Dashboard App — Login Page E2E Smoke Tests
 * baseURL: http://localhost:3000
 */

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should redirect unauthenticated users to login", async ({ page }) => {
    // Wait for redirect to complete (Clerk middleware)
    await page.waitForURL(/sign-in|login/, { timeout: 10_000 });
    expect(page.url()).toMatch(/sign-in|login/);
  });

  test("should render the Clerk sign-in form", async ({ page }) => {
    await page.waitForURL(/sign-in|login/, { timeout: 10_000 });
    // Clerk renders an email input field
    const emailInput = page.locator("input[name='identifier'], input[type='email']");
    await expect(emailInput).toBeVisible({ timeout: 8_000 });
  });

  test("should have the dashboard title tag", async ({ page }) => {
    await expect(page).toHaveTitle(/Hearth|Dashboard|Fungga/i);
  });
});

test.describe("Dashboard Shell (authenticated)", () => {
  // These tests require a logged-in session.
  // Use storageState or a global setup file once auth flow is established.
  test.skip("should render the sidebar navigation", async ({ page }) => {
    await page.goto("/overview");
    const nav = page.locator("nav[aria-label='Sidebar']");
    await expect(nav).toBeVisible();
  });

  test.skip("should render the overview KPI cards", async ({ page }) => {
    await page.goto("/overview");
    const kpiCards = page.locator("[data-slot='kpi-card']");
    await expect(kpiCards.first()).toBeVisible();
  });
});
