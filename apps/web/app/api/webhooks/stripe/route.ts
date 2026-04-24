import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing stripe-signature header or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
  
      const authId = session.metadata?.auth_id;
      if (!authId) {
        console.error("Stripe webhook: missing auth_id in session metadata");
        return NextResponse.json({ error: "Missing auth_id" }, { status: 400 });
      }
  
      if (session.payment_status !== "paid") {
        // Not yet paid — ignore (async payment methods may still be pending)
        return NextResponse.json({ received: true });
      }
  
      try {
        const supabase = createAdminClient();
  
        const email = session.customer_details?.email ?? session.customer_email ?? "";
  
        // We use the admin client to grant access by updating public.users matching the auth_id
        const { error } = await supabase
          .from("users")
          .update(
            {
              has_lifetime_access: true,
              updated_at: new Date().toISOString(),
            }
          )
          .eq("auth_id", authId);
  
        if (error) {
          console.error("Failed to grant lifetime access:", error);
          return NextResponse.json(
            { error: "Database update failed" },
            { status: 500 }
          );
        }
  
        console.log(`✅ Lifetime access granted to auth_id: ${authId}`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Supabase update error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }

  return NextResponse.json({ received: true });
}
