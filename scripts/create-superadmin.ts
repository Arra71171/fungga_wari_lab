import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSuperadmin() {
  console.log("Creating superadmin user in auth.users...");
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: "superadmin@funggawari.com",
    password: "FungaW@ri2026!",
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes("already exists") || authError.message.includes("already registered")) {
      console.log("User already exists in auth.users. Updating password just in case...");
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const user = existingUser?.users.find((u) => u.email === "superadmin@funggawari.com");
      if (user) {
        await supabase.auth.admin.updateUserById(user.id, { password: "FungaW@ri2026!" });
        console.log("Password updated for existing auth user.");
        await upsertPublicProfile(user.id);
      } else {
        console.error("User said it exists but couldn't find in list.");
      }
    } else {
      console.error("Error creating auth user:", authError);
      process.exit(1);
    }
  } else if (authData.user) {
    console.log("Auth user created successfully with ID:", authData.user.id);
    await upsertPublicProfile(authData.user.id);
  }
}

async function upsertPublicProfile(authId: string) {
  console.log(`Upserting public.users profile for auth_id: ${authId}...`);
  // Generate a determinist UUID for this specific superadmin or just generate a new one if it fails
  const publicUserId = "00000000-0000-0000-0000-000000000000";

  const { error: profileError } = await supabase
    .from("users")
    .upsert({
      id: publicUserId,
      auth_id: authId,
      name: "Superadmin User",
      email: "superadmin@funggawari.com",
      role: "superadmin",
      alias: "Superadmin",
      bio: "System Administrator with full access.",
      has_lifetime_access: true,
    }, { onConflict: "id" });

  if (profileError) {
    // Maybe the ID already exists for someone else or something, let's try upserting by auth_id if possible
    console.error("Error upserting profile:", profileError);
    console.log("Trying to insert without forcing ID...");
    const { error: fallbackError } = await supabase
      .from("users")
      .insert({
        auth_id: authId,
        name: "Superadmin User",
        email: "superadmin@funggawari.com",
        role: "superadmin",
        alias: "Superadmin",
        bio: "System Administrator with full access.",
        has_lifetime_access: true,
      });
      if (fallbackError) {
          console.error("Fallback insert failed:", fallbackError);
      } else {
          console.log("Fallback insert succeeded.");
      }
  } else {
    console.log("Public profile upserted successfully.");
  }
}

createSuperadmin().then(() => console.log("Done."));
