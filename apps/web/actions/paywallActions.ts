"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const LIFETIME_PRICE_INR = 89900; // ₹899 in paise

/**
 * createCheckoutSession — creates a Stripe Checkout session for lifetime access.
 * Designed to be used with .bind(null, slug) so PaywallOverlay can call it
 * as a form action: `const action = createCheckoutSession.bind(null, 'slug')`
 */
export async function createCheckoutSession(slug: string, _formData: FormData) {
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

  const successUrl = slug
    ? `${baseUrl}/stories/${slug}?payment=success`
    : `${baseUrl}/stories?payment=success`;

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
