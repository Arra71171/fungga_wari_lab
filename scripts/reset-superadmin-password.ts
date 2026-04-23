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

async function resetPassword() {
  const SUPERADMIN_EMAIL = "superadmin@funggawari.com";
  const SUPERADMIN_PASSWORD = "FungaW@ri2026!";

  console.log("Looking up auth user...");
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("Error listing users:", listError);
    process.exit(1);
  }

  const user = listData.users.find((u) => u.email === SUPERADMIN_EMAIL);
  if (!user) {
    console.error("Superadmin not found in auth.users!");
    process.exit(1);
  }

  console.log(`Found auth user: ${user.id}`);

  const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    password: SUPERADMIN_PASSWORD,
    email_confirm: true,
  });

  if (updateError) {
    console.error("Error updating password:", updateError);
    process.exit(1);
  }

  console.log("Password updated successfully:", updated.user?.email);

  // Also ensure public.users has role=superadmin
  const { error: roleError } = await supabase
    .from("users")
    .update({ role: "superadmin", has_lifetime_access: true })
    .eq("auth_id", user.id);

  if (roleError) {
    console.error("Error updating role:", roleError);
  } else {
    console.log("Role set to superadmin.");
  }

  console.log("\n✅ Superadmin credentials reset complete:");
  console.log(`   Email: ${SUPERADMIN_EMAIL}`);
  console.log(`   Password: ${SUPERADMIN_PASSWORD}`);
  console.log(`   Auth ID: ${user.id}`);
}

resetPassword().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
