import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_dummy_key_to_prevent_dev_server_crash";

if (stripeKey === "sk_test_dummy_key_to_prevent_dev_server_crash") {
  console.warn("⚠️ STRIPE_SECRET_KEY is not set in environment. Using dummy key. Checkout will fail.");
}

export const stripe = new Stripe(stripeKey, {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
});
