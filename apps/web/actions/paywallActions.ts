"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

const LIFETIME_PRICE_INR = 89900; // ₹899 in paise

/**
 * createCheckoutSession — creates a Stripe Checkout session for lifetime access.
 * Designed to be used with .bind(null, slug) so PaywallOverlay can call it
 * as a form action: `const action = createCheckoutSession.bind(null, 'slug')`
 */
export async function createCheckoutSession(slug: string, _formData: FormData) {
  void _formData;

  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const user = await currentUser();
  if (!user) {
    throw new Error("User not found");
  }

  const supabase = await createClient();

  // Check if user already has access
  const { data: supabaseUser } = await supabase
    .from("users")
    .select("has_lifetime_access, email")
    .eq("clerk_id", userId)
    .single();

  if (supabaseUser?.has_lifetime_access) {
    // Already paid — just redirect back
    redirect(slug ? `/stories/${slug}` : "/stories");
  }

  const email =
    supabaseUser?.email ??
    user.emailAddresses[0]?.emailAddress ??
    undefined;

  const baseUrl =
    process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3001";

  // Include {CHECKOUT_SESSION_ID} so we can verify the session server-side
  // when the user returns, without relying on the Stripe webhook.
  const successUrl = slug
    ? `${baseUrl}/stories/${slug}?payment=success&session_id={CHECKOUT_SESSION_ID}`
    : `${baseUrl}/stories?payment=success&session_id={CHECKOUT_SESSION_ID}`;

  const cancelUrl = slug
    ? `${baseUrl}/stories/${slug}?payment=cancelled`
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
      clerk_id: userId,
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
 *
 * This is the PRIMARY mechanism for granting access — it does NOT depend on
 * the Stripe webhook being configured or received. The webhook is a backup.
 */
export async function verifyAndGrantAccess(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not authenticated" };

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return { success: false, error: "Payment not completed" };
    }

    // Security: verify this session was created for this user
    const sessionClerkId = session.metadata?.clerk_id;
    if (sessionClerkId !== userId) {
      return { success: false, error: "Session does not belong to this user" };
    }

    const supabase = createAdminClient();
    const email =
      session.customer_details?.email ?? session.customer_email ?? "";

    const { error } = await supabase
      .from("users")
      .upsert(
        {
          clerk_id: userId,
          email: email,
          has_lifetime_access: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "clerk_id" }
      );

    if (error) {
      console.error("verifyAndGrantAccess: DB upsert failed:", error);
      return { success: false, error: "Database update failed" };
    }

    console.log(`✅ Lifetime access granted via session verify: ${userId}`);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("verifyAndGrantAccess error:", message);
    return { success: false, error: message };
  }
}

/**
 * checkUserAccess — returns whether the current Clerk user has lifetime access.
 * Used by server components to gate content.
 */
export async function checkUserAccess(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const supabase = await createClient();

  const { data } = await supabase
    .from("users")
    .select("has_lifetime_access")
    .eq("clerk_id", userId)
    .single();

  return data?.has_lifetime_access ?? false;
}
