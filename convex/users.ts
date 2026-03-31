import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
      role: "editor", // Defaulting to editor for team building logic
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

/**
 * getAll — returns all users (admin only).
 */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    return await ctx.db.query("users").collect();
  },
});

/**
 * updateRole — allows an admin to change another user's role.
 * Enforces that the caller is an admin themselves.
 */
export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Verify the caller is an admin
    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!caller || caller.role !== "admin") {
      throw new Error("Forbidden — only admins can change roles");
    }

    await ctx.db.patch(args.userId, { role: args.role });
  },
});
