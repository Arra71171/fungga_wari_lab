import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getFirstSceneByStoryId = query({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    const chapters = await ctx.db
      .query("chapters")
      .withIndex("by_storyId", (q) => q.eq("storyId", args.storyId))
      .order("asc")
      .collect();

    if (chapters.length === 0) return null;

    const scenes = await ctx.db
      .query("scenes")
      .withIndex("by_chapterId", (q) => q.eq("chapterId", chapters[0]!._id))
      .order("asc")
      .take(1);

    return scenes.length > 0 ? scenes[0] : null;
  },
});

export const getSceneDetails = query({
  args: { sceneId: v.id("scenes") },
  handler: async (ctx, args) => {
    const scene = await ctx.db.get(args.sceneId);
    if (!scene) return null;

    const choices = await ctx.db
      .query("choices")
      .withIndex("by_sceneId", (q) => q.eq("sceneId", args.sceneId))
      .collect();

    return { scene, choices };
  },
});

export const getByChapterId = query({
  args: { chapterId: v.id("chapters") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scenes")
      .withIndex("by_chapterId", (q) => q.eq("chapterId", args.chapterId))
      .order("asc")
      .collect();
  },
});

export const create = mutation({
  args: {
    chapterId: v.id("chapters"),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Unauthenticated");

    return await ctx.db.insert("scenes", {
      chapterId: args.chapterId,
      order: args.order,
      isDraft: true,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const saveSceneContent = mutation({
  args: {
    sceneId: v.id("scenes"),
    tiptapContent: v.any(),
    title: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    readingTime: v.optional(v.number()),
    isDraft: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Unauthenticated");

    const { sceneId, ...updates } = args;
    
    const existing = await ctx.db.get(sceneId);
    if (!existing) {
      throw new Error(`Scene not found: ${sceneId}`);
    }

    const version = (existing.version || 0) + 1;

    await ctx.db.patch(sceneId, {
      ...updates,
      version,
      updatedAt: Date.now(),
    });
    
    return { success: true, version };
  },
});
