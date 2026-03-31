import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("stories")
      .withIndex("by_slug") // status filter done in-memory — no status index, keep bounded
      .order("desc")
      .take(100);
  },
});

export const getFullBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const story = await ctx.db
      .query("stories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!story) return null;

    const chapters = await ctx.db
      .query("chapters")
      .withIndex("by_storyId", (q) => q.eq("storyId", story._id))
      .collect();

    const scenes = await Promise.all(
      chapters.map(async (chapter) => {
        return await ctx.db
          .query("scenes")
          .withIndex("by_chapterId", (q) => q.eq("chapterId", chapter._id))
          .collect();
      })
    );

    return {
      ...story,
      chapters: chapters.map((c, i) => ({
        ...c,
        scenes: scenes[i],
      })),
    };
  },
});

export const getById = query({
  args: { id: v.id("stories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getAdminAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Unauthenticated");

    return await ctx.db.query("stories").order("desc").take(200);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    category: v.string(),
    language: v.string(),
    coverImageUrl: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    return await ctx.db.insert("stories", {
      ...args,
      status: "draft",
      authorId: identity.subject,
    });
  },
});

export const createWithInitialScene = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    category: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const storyId = await ctx.db.insert("stories", {
      ...args,
      status: "draft",
      authorId: identity.subject,
      tags: [],
    });

    const chapterId = await ctx.db.insert("chapters", {
      storyId,
      title: "Chapter 1",
      order: 1,
    });

    const sceneId = await ctx.db.insert("scenes", {
      chapterId,
      title: "Initial Scene",
      order: 1,
      isDraft: true,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { storyId, sceneId };
  },
});
