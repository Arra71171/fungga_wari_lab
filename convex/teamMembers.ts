import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Unauthenticated");

    return await ctx.db.query("teamMembers").collect();
  },
});

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) return null;

    const member = await ctx.db
      .query("teamMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
      
    // If not found in teamMembers yet but authenticated, return a default mock
    // This allows the app to function until we wire up the auth hook properly
    if (!member) {
      return {
        _id: "mock_id" as any,
        _creationTime: Date.now(),
        userId: userId,
        name: "Unknown User",
        role: "viewer",
        avatarUrl: "/avatars/default.png"
      };
    }
    
    return member;
  },
});

export const updateRole = mutation({
  args: {
    memberId: v.id("teamMembers"),
    role: v.string(), // "admin" | "editor" | "viewer"
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Unauthenticated");

    // In a real app, verify that the caller is an admin here
    await ctx.db.patch(args.memberId, {
      role: args.role,
    });
  },
});
