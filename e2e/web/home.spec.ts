import { test, expect } from "@playwright/test";

/**
 * Web App — Home Page E2E Smoke Tests
 * baseURL: http://localhost:3001
 */

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should have correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Fungga Wari/i);
  });

  test("should render the hero headline", async ({ page }) => {
    const hero = page.locator("h1");
    await expect(hero).toBeVisible();
    await expect(hero).toContainText(/stories|silence|wari/i);
  });

  test("should render the navbar", async ({ page }) => {
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("should have a visible CTA button linking to /stories", async ({ page }) => {
    const cta = page.locator("a[href='/stories']").first();
    await expect(cta).toBeVisible();
  });

  test("should have no detectable accessibility violations on heading structure", async ({
    page,
  }) => {
    // Ensure single h1 per page (WCAG requirement)
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });

  test("should reach the stories page from CTA", async ({ page }) => {
    const cta = page.locator("a[href='/stories']").first();
    await cta.click();
    await page.waitForURL("**/stories");
    expect(page.url()).toContain("/stories");
  });
});
