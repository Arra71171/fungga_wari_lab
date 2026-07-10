"use server";

import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAppUrl } from "@workspace/ui/lib/utils";

const createCheckoutSessionSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).or(z.literal("")).optional(), // slug can be empty if general checkout
  planType: z.enum(["bard", "campfire"]).default("bard"),
});

const verifyAndGrantAccessSchema = z.object({
  sessionId: z.string().min(1),
});

/**
 * createCheckoutSession — creates a Stripe Checkout session for archive access (subscription).
 * Designed to be used with .bind(null, slug, planType) so PaywallOverlay can call it
 * as a form action: `const action = createCheckoutSession.bind(null, 'slug', 'bard')`
 */
export async function createCheckoutSession(slug: string, planType: "bard" | "campfire", _formData: FormData) {
  void _formData;

  const parsed = createCheckoutSessionSchema.safeParse({ slug, planType });
  if (!parsed.success) {
    throw new Error("Invalid request data");
  }
  const validatedSlug = parsed.data.slug;
  const validatedPlanType = parsed.data.planType;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = validatedSlug ? `/stories/${validatedSlug}?checkout=true` : "/stories?checkout=true";
    redirect(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
  }

  // Check if user already has access
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("has_lifetime_access, subscription_status, email")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("createCheckoutSession profile lookup error:", profileError);
  }

  if (profile?.has_lifetime_access || profile?.subscription_status === "active" || profile?.subscription_status === "trialing") {
    // Already has access — just redirect back
    redirect(slug ? `/stories/${slug}` : "/stories");
  }

  const email = profile?.email ?? user.email ?? undefined;

  const baseUrl = getAppUrl("web");

  const successUrl = validatedSlug
    ? `${baseUrl}/stories/${validatedSlug}?payment=success&session_id={CHECKOUT_SESSION_ID}`
    : `${baseUrl}/stories?payment=success&session_id={CHECKOUT_SESSION_ID}`;

  const cancelUrl = validatedSlug
    ? `${baseUrl}/stories/${validatedSlug}?payment=cancelled`
    : `${baseUrl}/stories`;

  const unitAmount = validatedPlanType === "campfire" ? 59900 : 29900;
  const planName = validatedPlanType === "campfire" ? "Campfire (Family)" : "Bard (Pro)";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "inr",
          recurring: {
            interval: "month",
          },
          product_data: {
            name: planName,
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      },
    ],
    subscription_data: {
      metadata: {
        auth_id: user.id,
        plan: validatedPlanType,
      },
    },
    metadata: {
      auth_id: user.id,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  if (!session.url) {
    throw new Error("Failed to create Stripe checkout session");
  }

  redirect(session.url);
}

/**
 * createWandererCheckoutSession — creates a one-time Stripe Checkout session for 14-day Wanderer access.
 */
export async function createWandererCheckoutSession(_formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent("/pricing")}`);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("has_lifetime_access, subscription_status, email")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (profile?.has_lifetime_access || profile?.subscription_status === "active" || profile?.subscription_status === "trialing") {
    redirect("/stories");
  }

  const email = profile?.email ?? user.email ?? undefined;
  const baseUrl = getAppUrl("web");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: "Wanderer Pass (14 Days)",
            description: "Full library access for 14 days",
          },
          unit_amount: 9900,
        },
        quantity: 1,
      },
    ],
    metadata: {
      auth_id: user.id,
      plan: "wanderer",
    },
    success_url: `${baseUrl}/stories?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pricing`,
  });

  if (!session.url) {
    throw new Error("Failed to create Stripe checkout session");
  }

  redirect(session.url);
}

/**
 * verifyAndGrantAccess — Called when the user returns from Stripe with a
 * session_id. Directly retrieves the session from Stripe, verifies it was
 * paid and belongs to this user, then grants subscription access in the DB.
 */
export async function verifyAndGrantAccess(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  const parsed = verifyAndGrantAccessSchema.safeParse({ sessionId });
  if (!parsed.success) {
    return { success: false, error: "Invalid session ID" };
  }
  const validatedSessionId = parsed.data.sessionId;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const session = await stripe.checkout.sessions.retrieve(validatedSessionId);

    if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
      return { success: false, error: "Payment not completed" };
    }

    // Security: verify this session was created for this user
    const sessionAuthId = session.metadata?.auth_id;
    const isAuthorized = sessionAuthId === user.id;

    if (!isAuthorized) {
      return { success: false, error: "Session does not belong to this user" };
    }

    const adminSupabase = createAdminClient();

    const email = session.customer_details?.email ?? session.customer_email ?? "";
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
    
    const isWanderer = session.metadata?.plan === "wanderer";
    const statusToSet = isWanderer ? "wanderer" : "active";
    const periodEnd = isWanderer ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() : undefined;
    
    // We update basic fields. Webhook will handle the detailed sync.
    const { data: updatedProfile, error } = await adminSupabase
      .from("users")
      .update({
        ...(customerId ? { stripe_customer_id: customerId } : {}),
        ...(subscriptionId ? { stripe_subscription_id: subscriptionId, subscription_status: statusToSet } : {}),
        ...(isWanderer ? { subscription_status: "wanderer", subscription_period_end: periodEnd } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("auth_id", user.id)
      .select("id")
      .maybeSingle();

    if (error || !updatedProfile) {
      const errorMessage = error ? error.message : "User profile not found in database (auth_id sync issue)";
      console.error("verifyAndGrantAccess: DB update failed:", error ?? "No user row found for auth_id");
      return { success: false, error: errorMessage };
    }

    console.log("✅ Subscription access granted via session verify");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("verifyAndGrantAccess error:", message);
    return { success: false, error: message };
  }
}

/**
 * checkUserAccess — returns whether the current user (or story itself) grants access.
 *
 * Accepts an optional `slug` to check the story's `is_free` column first.
 * This replaces the previous hardcoded `slug === "nongpok-ningthou-test"` bypass
 * in the route handler — access is now entirely data-driven.
 *
 * @param slug - Optional story slug. When provided, free stories bypass the paywall.
 */
export async function checkUserAccess(slug?: string): Promise<boolean> {
  const supabase = await createClient();

  // Check if the story itself is free — no auth required
  if (slug) {
    const { data: story } = await supabase
      .from("stories")
      .select("is_free")
      .eq("slug", slug)
      .single();

    if (story?.is_free) return true;
  }

  // Fall back to checking the authenticated user's lifetime/subscription access
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("users")
    .select("has_lifetime_access, subscription_status, subscription_period_end")
    .eq("auth_id", user.id)
    .single();

  const isWandererActive = data?.subscription_status === "wanderer" && data?.subscription_period_end && new Date(data.subscription_period_end) > new Date();
  const hasSub = data?.subscription_status === "active" || data?.subscription_status === "trialing" || isWandererActive;
  return Boolean(data?.has_lifetime_access || hasSub);
}
/**
 * createCustomerPortalSession — creates a Stripe Customer Portal session
 * for users to manage their billing and download receipts.
 */
export async function createCustomerPortalSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("email, stripe_customer_id")
    .eq("auth_id", user.id)
    .single();

  if (error || !profile?.email) {
    throw new Error("Failed to find user profile for Customer Portal");
  }

  const baseUrl = getAppUrl("web");
  let customerId = profile.stripe_customer_id;

  // Search for the customer in Stripe by email if no ID is saved
  if (!customerId) {
    const customers = await stripe.customers.search({
      query: `email:'${profile.email}'`,
      limit: 1,
    });

    if (customers.data.length === 0) {
      throw new Error("No Stripe customer found. Have you subscribed?");
    }
    customerId = customers.data[0]!.id;
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}/stories`,
  });

  redirect(session.url);
}
