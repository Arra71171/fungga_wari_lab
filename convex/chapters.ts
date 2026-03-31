
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getByStoryId = query({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chapters")
      .withIndex("by_storyId", (q) => q.eq("storyId", args.storyId))
      .collect();
  },
});

export const create = mutation({
  args: {
    storyId: v.id("stories"),
    title: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Unauthenticated");

    return await ctx.db.insert("chapters", {
      storyId: args.storyId,
      title: args.title,
      order: args.order,
    });
  },
});
