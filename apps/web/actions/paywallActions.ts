"use server";

import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { z } from "zod";

const createCheckoutSessionSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(), // slug can be empty if general checkout
});

const verifyAndGrantAccessSchema = z.object({
  sessionId: z.string().min(1),
});

const LIFETIME_PRICE_INR = 89900; // ₹899 in paise

/**
 * createCheckoutSession — creates a Stripe Checkout session for lifetime access.
 * Designed to be used with .bind(null, slug) so PaywallOverlay can call it
 * as a form action: `const action = createCheckoutSession.bind(null, 'slug')`
 */
export async function createCheckoutSession(slug: string, _formData: FormData) {
  void _formData;

  const parsed = createCheckoutSessionSchema.safeParse({ slug });
  if (!parsed.success) {
    throw new Error("Invalid request data");
  }
  const validatedSlug = parsed.data.slug;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user already has access
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("has_lifetime_access, email")
    .eq("auth_id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Failed to lookup user profile");
  }

  if (profile.has_lifetime_access) {
    // Already paid — just redirect back
    redirect(slug ? `/stories/${slug}` : "/stories");
  }

  const email = profile?.email ?? user.email ?? undefined;

  const baseUrl =
    process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3001";

  const successUrl = validatedSlug
    ? `${baseUrl}/stories/${validatedSlug}?payment=success&session_id={CHECKOUT_SESSION_ID}`
    : `${baseUrl}/stories?payment=success&session_id={CHECKOUT_SESSION_ID}`;

  const cancelUrl = validatedSlug
    ? `${baseUrl}/stories/${validatedSlug}?payment=cancelled`
    : `${baseUrl}/stories`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "inr",
          unit_amount: LIFETIME_PRICE_INR,
          product_data: {
            name: "Fungga Wari Lab — Lifetime Access",
            description:
              "Unlock the complete folk story archive. One-time payment, unlimited access forever.",
            images: [
              `${baseUrl}/og-cover.png`,
            ],
          },
        },
      },
    ],
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
 * verifyAndGrantAccess — Called when the user returns from Stripe with a
 * session_id. Directly retrieves the session from Stripe, verifies it was
 * paid and belongs to this user, then grants lifetime access in the DB.
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

    if (session.payment_status !== "paid") {
      return { success: false, error: "Payment not completed" };
    }

    // Security: verify this session was created for this user
    const sessionAuthId = session.metadata?.auth_id;
    const sessionClerkId = session.metadata?.user_id; // legacy clerk ID
    
    // Support legacy verify by looking up the clerk_id mapping
    let isAuthorized = sessionAuthId === user.id;
    
    if (!isAuthorized && sessionClerkId) {
      const { data: profile } = await supabase
        .from("users")
        .select("clerk_id")
        .eq("auth_id", user.id)
        .single();
        
      isAuthorized = profile?.clerk_id === sessionClerkId;
    }

    if (!isAuthorized) {
      return { success: false, error: "Session does not belong to this user" };
    }

    const adminSupabase = createAdminClient();

    const email = session.customer_details?.email ?? session.customer_email ?? "";

    const { data: updatedProfile, error } = await adminSupabase
      .from("users")
      .upsert(
        {
          auth_id: user.id,
          email: email,
          has_lifetime_access: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "auth_id" }
      )
      .select("id")
      .maybeSingle();

    if (error || !updatedProfile) {
      console.error("verifyAndGrantAccess: DB update failed:", error ?? "No user row found for auth_id");
      return { success: false, error: "Database update failed" };
    }

    console.log("✅ Lifetime access granted via session verify");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("verifyAndGrantAccess error:", message);
    return { success: false, error: message };
  }
}

/**
 * checkUserAccess — returns whether the current user has lifetime access.
 * Used by server components to gate content.
 */
export async function checkUserAccess(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("users")
    .select("has_lifetime_access")
    .eq("auth_id", user.id)
    .single();

  return data?.has_lifetime_access ?? false;
}
