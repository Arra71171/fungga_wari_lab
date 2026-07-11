-- Migration to add Stripe Subscription fields to users table

ALTER TABLE public.users 
ADD COLUMN stripe_customer_id text UNIQUE,
ADD COLUMN stripe_subscription_id text UNIQUE,
ADD COLUMN subscription_status text,
ADD COLUMN subscription_price_id text,
ADD COLUMN subscription_period_end timestamptz;

-- Set up index for querying by customer ID for webhooks
CREATE INDEX IF NOT EXISTS users_stripe_customer_id_idx ON public.users(stripe_customer_id);
