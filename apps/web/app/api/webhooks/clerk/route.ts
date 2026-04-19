import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET from environment variables');
    return new Response('Error: Missing webhook secret', { status: 500 });
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  const eventType = evt.type;

  // Sync user creation and updates to Supabase
  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    
    // Clerk provides an array of emails, get the primary one
    const email = email_addresses?.[0]?.email_address ?? null;
    const fullName = [first_name, last_name].filter(Boolean).join(' ') || null;

    const supabase = createAdminClient();

    const { error } = await supabase.from('users').upsert({
      clerk_id: id,
      email: email,
      name: fullName,
      avatar_url: image_url || null,
    }, {
      onConflict: 'clerk_id'
    });

    if (error) {
      console.error('Error upserting user to Supabase:', error.message);
      return new Response('Error syncing user', { status: 500 });
    }
    
    console.log(`✅ Successfully synced Clerk user ${id} to Supabase`);
  }

  return new Response('', { status: 200 });
}
