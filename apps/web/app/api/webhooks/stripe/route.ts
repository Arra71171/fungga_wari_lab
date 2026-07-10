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

    const supabase = createAdminClient();

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const authId = subscription.metadata?.auth_id;

      if (!authId) {
        console.error("Stripe webhook: missing auth_id in subscription metadata");
        return NextResponse.json({ error: "Missing auth_id in metadata" }, { status: 400 });
      }

      try {
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
        const priceId = subscription.items.data[0]?.price.id;
        const subscriptionData = subscription as unknown as { current_period_end: number };
        const periodEnd = new Date(subscriptionData.current_period_end * 1000).toISOString();

        const { error } = await supabase
          .from("users")
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            subscription_price_id: priceId,
            subscription_period_end: periodEnd,
            updated_at: new Date().toISOString(),
          })
          .eq("auth_id", authId);

        if (error) {
          console.error("Failed to sync subscription to db:", error);
          return NextResponse.json(
            { error: "Database update failed: " + error.message },
            { status: 500 }
          );
        }
        
        console.log(`✅ Subscription ${subscription.id} synced for auth_id: ${authId}. Status: ${subscription.status}`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Supabase update error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
      }
    } else if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Handle Wanderer pass (one-time payment)
      if (session.mode === "payment" && session.payment_status === "paid" && session.metadata?.plan === "wanderer") {
        const authId = session.metadata.auth_id;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        
        if (authId) {
          const periodEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
          const { error } = await supabase
            .from("users")
            .update({
              subscription_status: "wanderer",
              subscription_period_end: periodEnd,
              ...(customerId ? { stripe_customer_id: customerId } : {}),
              updated_at: new Date().toISOString(),
            })
            .eq("auth_id", authId);
            
          if (error) {
            console.error("Failed to grant Wanderer access:", error);
            return NextResponse.json({ error: "Failed to grant Wanderer access" }, { status: 500 });
          }
          console.log(`✅ Wanderer 14-day pass granted to auth_id: ${authId}`);
        }
      } else if (session.mode === "subscription" && session.payment_status === "paid") {
         console.log("Checkout session completed for subscription, awaiting subscription.created webhook for full sync");
      }
    }

  return NextResponse.json({ received: true });
}
