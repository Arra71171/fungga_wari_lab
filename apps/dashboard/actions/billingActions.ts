"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "./authHelpers";
import { revalidatePath } from "next/cache";

const authIdSchema = z.string().uuid();

/**
 * toggleLifetimeAccess — grant or revoke lifetime access for a user.
 * Restricted to admin/superadmin callers only.
 */
export async function toggleLifetimeAccess(rawAuthId: string, grantAccess: boolean) {
  const authId = authIdSchema.parse(rawAuthId);
  const validatedGrantAccess = z.boolean().parse(grantAccess);
  const { profile: caller } = await requireUser();

  if (caller.role !== "superadmin" && caller.role !== "admin") {
    throw new Error("Forbidden — only admins and superadmins can toggle lifetime access");
  }

  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase
    .from("users")
    .upsert(
      { auth_id: authId, has_lifetime_access: validatedGrantAccess },
      { onConflict: "auth_id" }
    );

  if (error) {
    throw new Error("Failed to update access: " + error.message);
  }

  revalidatePath("/billing");
}

/**
 * getBillingStatus — check whether a user has lifetime access.
 * Requires authentication.
 */
export async function getBillingStatus(rawAuthId: string) {
  const authId = authIdSchema.parse(rawAuthId);
  const { profile: caller } = await requireUser();

  if (caller.auth_id !== authId && caller.role !== "superadmin" && caller.role !== "admin") {
    throw new Error("Forbidden — you can only view your own billing status");
  }

  const adminSupabase = createAdminClient();

  const { data, error } = await adminSupabase
    .from("users")
    .select("has_lifetime_access, subscription_status")
    .eq("auth_id", authId)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to fetch billing status");
  }

  return {
    has_lifetime_access: data?.has_lifetime_access ?? false,
    subscription_status: data?.subscription_status ?? "none",
  };
}
