import { expect, test } from "@playwright/test";
import {
  ensureE2EUser,
  findUserRow,
  loginToDashboard,
} from "../support/testBackend";

test.describe("Dashboard authentication", () => {
  test("redirects unauthenticated visitors to login", async ({ page }) => {
    await page.goto("/overview");

    await page.waitForURL(/\/login/, { timeout: 30_000 });
    await expect(page.locator("input[name='identifier']")).toBeVisible();
    await expect(page).toHaveTitle(/creator studio|fungga/i);
  });

  test("signs in with Clerk and syncs the user into Supabase", async ({ page }) => {
    const user = await ensureE2EUser();

    await loginToDashboard(page, user);

    await expect(page).toHaveURL(/\/overview$/);
    await expect(page.locator("h1")).toContainText(/welcome back|overview/i);

    await expect
      .poll(async () => Boolean(await findUserRow(user.clerkId)), { timeout: 60_000 })
      .toBe(true);
  });
});
