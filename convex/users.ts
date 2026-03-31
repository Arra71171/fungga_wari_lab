import { mutation, query } from "./_generated/server";

/**
 * syncUser — call this on first authenticated page load.
 * Creates a Convex user record if one doesn't already exist for the Clerk identity.
 */
export const syncUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (existing) return existing;

    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email ?? undefined,
      name: identity.name ?? undefined,
      avatarUrl: identity.pictureUrl ?? undefined,
    });

    return await ctx.db.get(userId);
  },
});

/**
 * getMe — returns the current user's Convex record, or null if not authenticated / not yet synced.
 */
export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});
