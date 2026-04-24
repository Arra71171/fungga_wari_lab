import { createClerkClient } from "@clerk/backend";
import { loadEnvConfig } from "@next/env";
import type { APIRequestContext, Page } from "@playwright/test";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

loadEnvConfig(process.cwd());

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export type E2EUser = {
  clerkId: string;
  email: string;
  password: string;
};

type StoryRecord = {
  author_id: string;
  cover_image_url: string | null;
  id: string;
  slug: string;
  status: string;
  title: string;
};

type SceneRecord = {
  chapter_id: string;
  content: string | null;
  id: string;
  tiptap_content: Record<string, unknown> | null;
};

type UserRecord = {
  auth_id: string;
  has_lifetime_access: boolean;
  id: string;
};

const clerkSecretKey = requireEnv("CLERK_SECRET_KEY");
const stripeSecretKey = requireEnv("STRIPE_SECRET_KEY");
const stripeWebhookSecret = requireEnv("STRIPE_WEBHOOK_SECRET");
const supabaseServiceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");

export const urls = {
  dashboard: process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3000",
  web: process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3001",
};

const clerkClient = createClerkClient({ secretKey: clerkSecretKey });
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
});

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const testEmail = process.env.E2E_CLERK_EMAIL ?? "qa.audit.playwright@funggawari.dev";
const testPassword = process.env.E2E_CLERK_PASSWORD ?? "FunggaWari!1234";
const testCoverFileName = "qa-audit-cover.png";
const qaAuditName = "QA Audit";

export const auditCoverUpload = {
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7ZtioAAAAASUVORK5CYII=",
    "base64",
  ),
  mimeType: "image/png",
  name: testCoverFileName,
};

async function ensureE2EOrganization(clerkId: string, organizationId?: string | null) {
  let organization;

  if (organizationId) {
    try {
      organization = await clerkClient.organizations.getOrganization({ organizationId });
    } catch {
      organization = null;
    }
  }

  if (!organization) {
    organization = await clerkClient.organizations.createOrganization({
      createdBy: clerkId,
      name: `${qaAuditName} Forge`,
    });
  }

  const memberships = await clerkClient.organizations.getOrganizationMembershipList({
    limit: 1,
    organizationId: organization.id,
    userId: [clerkId],
  });

  if (memberships.data.length === 0) {
    await clerkClient.organizations.createOrganizationMembership({
      organizationId: organization.id,
      role: "org:admin",
      userId: clerkId,
    });
  }

  return organization.id;
}

async function ensureAdminUserRow(user: E2EUser) {
  const { error } = await supabase.from("users").upsert(
    {
      auth_id: user.clerkId,
      email: user.email,
      has_lifetime_access: false,
      name: qaAuditName,
      role: "admin",
    },
    { onConflict: "auth_id" },
  );

  if (error) {
    throw new Error(`Failed to upsert audit user row: ${error.message}`);
  }
}

export async function ensureE2EUser(): Promise<E2EUser> {
  const existingUsers = await clerkClient.users.getUserList({
    emailAddress: [testEmail],
    limit: 1,
  });

  const existingUser = existingUsers.data[0];

  if (existingUser) {
    const user = {
      clerkId: existingUser.id,
      email: testEmail,
      password: testPassword,
    };

    const organizationId =
      typeof existingUser.privateMetadata?.qaOrgId === "string"
        ? existingUser.privateMetadata.qaOrgId
        : null;
    const ensuredOrganizationId = await ensureE2EOrganization(user.clerkId, organizationId);
    await clerkClient.users.updateUser(existingUser.id, {
      firstName: "QA",
      lastName: "Audit",
      password: testPassword,
      privateMetadata: { qaOrgId: ensuredOrganizationId },
      publicMetadata: { role: "admin" },
      skipPasswordChecks: true,
    });
    await ensureAdminUserRow(user);

    return user;
  }

  const createdUser = await clerkClient.users.createUser({
    emailAddress: [testEmail],
    firstName: "QA",
    lastName: "Audit",
    password: testPassword,
    skipLegalChecks: true,
    skipPasswordChecks: true,
  });

  const user = {
    clerkId: createdUser.id,
    email: testEmail,
    password: testPassword,
  };

  const ensuredOrganizationId = await ensureE2EOrganization(user.clerkId);
  await clerkClient.users.updateUser(createdUser.id, {
    privateMetadata: { qaOrgId: ensuredOrganizationId },
    publicMetadata: { role: "admin" },
  });
  await ensureAdminUserRow(user);

  return user;
}

export async function loginToDashboard(page: Page, existingUser?: E2EUser): Promise<E2EUser> {
  const user = existingUser ?? (await ensureE2EUser());

  await page.addInitScript(() => {
    window.localStorage.setItem("hasSeenDashboardTour", "true");
  });

  await page.goto(`${urls.dashboard}/overview`);
  await page.waitForURL(/\/(login|overview)/, { timeout: 60_000 });

  if (!page.url().includes("/overview")) {
    await page.locator("input[name='identifier']").fill(user.email);
    await page.locator("input[name='password']").fill(user.password);

    await Promise.all([
      page.waitForURL(/\/overview$/, { timeout: 90_000 }),
      page.getByRole("button", { name: /accessing|sign in|continue/i }).first().click(),
    ]);
  }

  return user;
}

export async function findUserRow(clerkId: string): Promise<UserRecord | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, auth_id, has_lifetime_access")
    .eq("auth_id", clerkId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch user row: ${error.message}`);
  }

  return data;
}

export async function updateLifetimeAccess(clerkId: string, hasLifetimeAccess: boolean) {
  const { error } = await supabase
    .from("users")
    .update({ has_lifetime_access: hasLifetimeAccess })
    .eq("auth_id", clerkId);

  if (error) {
    throw new Error(`Failed to update lifetime access: ${error.message}`);
  }
}

export async function deleteAuditStories(clerkId: string) {
  const { data: stories, error: storyQueryError } = await supabase
    .from("stories")
    .select("id")
    .eq("author_id", clerkId)
    .ilike("title", "QA Audit %");

  if (storyQueryError) {
    throw new Error(`Failed to list audit stories: ${storyQueryError.message}`);
  }

  const storyIds = (stories ?? []).map((story) => story.id);

  if (storyIds.length > 0) {
    const { error: assetDeleteError } = await supabase
      .from("assets")
      .delete()
      .in("story_id", storyIds);

    if (assetDeleteError) {
      throw new Error(`Failed to delete audit assets: ${assetDeleteError.message}`);
    }

    const { error: storyDeleteError } = await supabase
      .from("stories")
      .delete()
      .in("id", storyIds);

    if (storyDeleteError) {
      throw new Error(`Failed to delete audit stories: ${storyDeleteError.message}`);
    }
  }

  const { error: coverCleanupError } = await supabase
    .from("assets")
    .delete()
    .eq("uploaded_by", clerkId)
    .eq("title", testCoverFileName);

  if (coverCleanupError) {
    throw new Error(`Failed to delete audit cover assets: ${coverCleanupError.message}`);
  }
}

export async function deleteStoryById(storyId: string) {
  const { error: assetDeleteError } = await supabase
    .from("assets")
    .delete()
    .eq("story_id", storyId);

  if (assetDeleteError) {
    throw new Error(`Failed to delete story assets: ${assetDeleteError.message}`);
  }

  const { error } = await supabase
    .from("stories")
    .delete()
    .eq("id", storyId);

  if (error) {
    throw new Error(`Failed to delete story ${storyId}: ${error.message}`);
  }
}

export async function getStoryById(storyId: string): Promise<StoryRecord | null> {
  const { data, error } = await supabase
    .from("stories")
    .select("id, title, slug, status, cover_image_url, author_id")
    .eq("id", storyId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch story ${storyId}: ${error.message}`);
  }

  return data;
}

export async function getStoryBySlug(slug: string): Promise<StoryRecord | null> {
  const { data, error } = await supabase
    .from("stories")
    .select("id, title, slug, status, cover_image_url, author_id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch story slug ${slug}: ${error.message}`);
  }

  return data;
}

export async function getScenesForStory(storyId: string): Promise<SceneRecord[]> {
  const { data: chapters, error: chapterError } = await supabase
    .from("chapters")
    .select("id")
    .eq("story_id", storyId);

  if (chapterError) {
    throw new Error(`Failed to fetch chapters for story ${storyId}: ${chapterError.message}`);
  }

  const chapterIds = (chapters ?? []).map((chapter) => chapter.id);

  if (chapterIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("scenes")
    .select("id, chapter_id, content, tiptap_content")
    .in("chapter_id", chapterIds);

  if (error) {
    throw new Error(`Failed to fetch scenes for story ${storyId}: ${error.message}`);
  }

  return data ?? [];
}

export async function findCoverAssetByUrl(clerkId: string, url: string) {
  const { data, error } = await supabase
    .from("assets")
    .select("id")
    .eq("uploaded_by", clerkId)
    .eq("type", "cover")
    .eq("url", url)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch cover asset: ${error.message}`);
  }

  return data;
}

export async function simulateSuccessfulCheckoutWebhook(
  request: APIRequestContext,
  clerkId: string,
) {
  const payload = JSON.stringify({
    api_version: "2026-03-25.dahlia",
    data: {
      object: {
        id: `cs_test_${Date.now()}`,
        metadata: {
          auth_id: clerkId,
        },
        object: "checkout.session",
        payment_status: "paid",
      },
    },
    id: `evt_test_${Date.now()}`,
    object: "event",
    type: "checkout.session.completed",
  });

  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: stripeWebhookSecret,
  });

  return request.post(`${urls.web}/api/webhooks/stripe`, {
    data: payload,
    failOnStatusCode: false,
    headers: {
      "content-type": "application/json",
      "stripe-signature": signature,
    },
  });
}
