import { expect, test } from "@playwright/test";

test.describe("Public reader surfaces", () => {
  test("renders the landing page and reaches the public archive", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Fungga Wari/i);
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();

    const cta = page.locator("a[href='/stories']").first();
    await expect(cta).toBeVisible();

    await cta.click();
    await page.waitForURL("**/stories");

    await expect(page.getByRole("heading", { name: /the manuscripts/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /search manuscripts/i })).toBeVisible();
  });

  test("renders published archive cards for signed-out readers", async ({ page }) => {
    await page.goto("/stories");

    await expect(page.getByRole("heading", { name: /the manuscripts/i })).toBeVisible();
    await expect(page.locator("a[href^='/stories/']").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });
});
