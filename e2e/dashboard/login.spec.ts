import { expect, test } from "@playwright/test";
import {
  ensureE2EUser,
  findUserRow,
  loginToDashboard,
} from "../support/testBackend";

test.describe("Dashboard authentication", () => {
  test("redirects unauthenticated visitors to login", async ({ page }) => {
    await page.goto("/dashboard/overview");

    await page.waitForURL(/\/login/, { timeout: 30_000 });
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page).toHaveTitle(/creator studio|fungga/i);
  });

  test("signs in with Supabase Auth and syncs the user into Supabase", async ({ page }) => {
    const user = await ensureE2EUser();

    await loginToDashboard(page, user);

    await expect(page).toHaveURL(/\/overview$/);
    await expect(page.locator("h1")).toContainText(/welcome back|overview/i);

    await expect
      .poll(async () => Boolean(await findUserRow(user.authId)), { timeout: 60_000 })
      .toBe(true);
  });
});
