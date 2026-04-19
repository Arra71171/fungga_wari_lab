import { expect, test } from "@playwright/test";
import {
  auditCoverUpload,
  deleteAuditStories,
  deleteStoryById,
  ensureE2EUser,
  findCoverAssetByUrl,
  findUserRow,
  getScenesForStory,
  getStoryById,
  loginToDashboard,
  simulateSuccessfulCheckoutWebhook,
  updateLifetimeAccess,
  urls,
  type E2EUser,
} from "../support/testBackend";

test.describe.serial("Creator-to-reader premium lifecycle", () => {
  test.setTimeout(180_000);

  let storyId = "";
  let storySlug = "";
  let user: E2EUser;
  const storyTitle = `QA Audit ${Date.now()}`;

  test.beforeAll(async () => {
    user = await ensureE2EUser();
    await deleteAuditStories(user.clerkId);
    await updateLifetimeAccess(user.clerkId, false);
  });

  test.afterAll(async () => {
    if (storyId) {
      await deleteStoryById(storyId);
    }

    await updateLifetimeAccess(user.clerkId, false);
  });

  test("creates a manuscript, uploads cover media, and publishes it", async ({ page }) => {
    await loginToDashboard(page, user);

    await expect
      .poll(async () => Boolean(await findUserRow(user.clerkId)), { timeout: 60_000 })
      .toBe(true);

    await page.goto(`${urls.dashboard}/stories`);
    await page.getByRole("button", { name: /new manuscript|establish first manuscript/i }).click();
    await page.waitForURL(/\/stories\/draft\/([0-9a-f-]+)$/i, { timeout: 60_000 });

    storyId = page.url().split("/").pop() ?? "";
    expect(storyId).toMatch(/[0-9a-f-]{36}/i);

    await page.getByPlaceholder(/the tale of the bamboo cutter/i).fill(storyTitle);

    const descriptionField = page.getByPlaceholder(/a brief summary of the story/i);
    await descriptionField.fill("QA audit manuscript created by the deployment-readiness suite.");
    await descriptionField.blur();

    await page
      .locator("input[accept='image/png, image/jpeg, image/webp']")
      .first()
      .setInputFiles(auditCoverUpload);
    await expect(page.getByAltText(/cover preview/i)).toBeVisible({ timeout: 120_000 });

    await page.getByRole("button", { name: /start the first chapter/i }).click();
    await page.getByPlaceholder(/the discovery of the bamboo grove/i).fill("Opening Chapter");

    const editor = page.locator(".ProseMirror").first();
    await expect(editor).toBeVisible({ timeout: 60_000 });
    await editor.click();
    await page.keyboard.type("QA audit scene content for the cinematic reader.");

    await Promise.all([
      page.waitForURL(/\/stories$/, { timeout: 60_000 }),
      page.getByRole("button", { name: /^publish$/i }).click(),
    ]);

    await expect
      .poll(async () => (await getStoryById(storyId))?.cover_image_url ?? null, {
        timeout: 120_000,
      })
      .toMatch(/^https:\/\/res\.cloudinary\.com\//);

    await expect
      .poll(async () => {
        const story = await getStoryById(storyId);

        return Boolean(
          story?.cover_image_url &&
            (await findCoverAssetByUrl(user.clerkId, story.cover_image_url)),
        );
      }, {
        timeout: 120_000,
      })
      .toBe(true);

    await expect
      .poll(async () => {
        const scenes = await getScenesForStory(storyId);

        return scenes.some((scene) => {
          const serializedContent = JSON.stringify(scene.tiptap_content ?? {});

          return (
            Boolean(scene.content?.includes("QA audit scene content")) ||
            serializedContent.includes("QA audit scene content")
          );
        });
      }, {
        timeout: 120_000,
      })
      .toBe(true);

    await expect
      .poll(async () => (await getStoryById(storyId))?.status ?? null, { timeout: 60_000 })
      .toBe("published");

    storySlug = (await getStoryById(storyId))?.slug ?? "";
    expect(storySlug).toBeTruthy();
  });

  test("creates a Stripe checkout session and unlocks the published manuscript", async ({
    page,
    request,
  }) => {
    expect(storySlug).toBeTruthy();

    await loginToDashboard(page, user);
    await updateLifetimeAccess(user.clerkId, false);

    const storyUrl = `${urls.web}/stories/${storySlug}`;

    await page.goto(storyUrl);
    await expect(page.locator("[data-slot='paywall-overlay']")).toBeVisible();
    await expect(page.getByRole("heading", { name: /unlock the full archive/i })).toBeVisible();

    await Promise.all([
      page.waitForURL(/checkout\.stripe\.com/, { timeout: 60_000 }),
      page.getByRole("button", { name: /unlock lifetime access/i }).click(),
    ]);

    const webhookResponse = await simulateSuccessfulCheckoutWebhook(request, user.clerkId);
    expect(webhookResponse.ok()).toBeTruthy();

    await expect
      .poll(async () => (await findUserRow(user.clerkId))?.has_lifetime_access ?? false, {
        timeout: 60_000,
      })
      .toBe(true);

    await page.goto(storyUrl);
    await expect(page.locator("[data-slot='paywall-overlay']")).toHaveCount(0);
    await expect(page.getByText(/QA audit scene content for the cinematic reader/i)).toBeVisible();
  });
});
