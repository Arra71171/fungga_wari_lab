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
  authId: string;
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

const stripeSecretKey = requireEnv("STRIPE_SECRET_KEY");
const stripeWebhookSecret = requireEnv("STRIPE_WEBHOOK_SECRET");
const supabaseServiceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");

export const urls = {
  dashboard: process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3000",
  web: process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3001",
};

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

const testEmail = process.env.E2E_USER_EMAIL ?? "qa.audit.playwright@funggawari.dev";
const testPassword = process.env.E2E_USER_PASSWORD ?? "FunggaWari!1234";
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


async function ensureAdminUserRow(user: E2EUser) {
  const { error } = await supabase.from("users").upsert(
    {
      auth_id: user.authId,
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
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    throw new Error(`Failed to list users: ${listError.message}`);
  }

  const existingUser = users.find(u => u.email === testEmail);

  if (existingUser) {
    const user = {
      authId: existingUser.id,
      email: testEmail,
      password: testPassword,
    };
    await ensureAdminUserRow(user);
    return user;
  }

  const { data: { user: createdUser }, error: createError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: { role: "admin" }
  });

  if (createError || !createdUser) {
    throw new Error(`Failed to create test user: ${createError?.message}`);
  }

  const user = {
    authId: createdUser.id,
    email: testEmail,
    password: testPassword,
  };

  await ensureAdminUserRow(user);

  return user;
}

export async function loginToDashboard(page: Page, existingUser?: E2EUser): Promise<E2EUser> {
  const user = existingUser ?? (await ensureE2EUser());

  await page.addInitScript(() => {
    window.localStorage.setItem("hasSeenDashboardTour", "true");
  });

  await page.goto("/dashboard/overview");
  await page.waitForURL(/\/(login|overview)/, { timeout: 60_000 });

  if (!page.url().includes("/overview")) {
    await page.locator("input[type='email']").fill(user.email);
    await page.locator("input[type='password']").fill(user.password);

    await Promise.all([
      page.waitForURL(/\/overview$/, { timeout: 90_000 }),
      page.getByRole("button", { name: /accessing|access archive|sign in|continue/i }).first().click(),
    ]);
  }

  return user;
}

export async function findUserRow(authId: string): Promise<UserRecord | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, auth_id, has_lifetime_access")
    .eq("auth_id", authId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch user row: ${error.message}`);
  }

  return data;
}

export async function updateLifetimeAccess(authId: string, hasLifetimeAccess: boolean) {
  const { error } = await supabase
    .from("users")
    .update({ has_lifetime_access: hasLifetimeAccess })
    .eq("auth_id", authId);

  if (error) {
    throw new Error(`Failed to update lifetime access: ${error.message}`);
  }
}

export async function deleteAuditStories(authId: string) {
  const { data: stories, error: storyQueryError } = await supabase
    .from("stories")
    .select("id")
    .eq("author_id", authId)
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
    .eq("uploaded_by", authId)
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

export async function findCoverAssetByUrl(authId: string, url: string) {
  const { data, error } = await supabase
    .from("assets")
    .select("id")
    .eq("uploaded_by", authId)
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
  authId: string,
) {
  const payload = JSON.stringify({
    api_version: "2026-03-25.dahlia",
    data: {
      object: {
        id: `cs_test_${Date.now()}`,
        metadata: {
          auth_id: authId,
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

  const response = await request.post(`${urls.web}/api/webhooks/stripe`, {
    data: payload,
    failOnStatusCode: false,
    headers: {
      "content-type": "application/json",
      "stripe-signature": signature,
    },
  });
  if (!response.ok()) {
    console.error("Webhook failed:", response.status(), await response.text());
  }
  return response;
}
