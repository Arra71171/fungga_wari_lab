import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Unauthenticated");

    return await ctx.storage.generateUploadUrl();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("assets").order("desc").take(100);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    type: v.string(),
    url: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    tags: v.array(v.string()),
    storyId: v.optional(v.id("stories")),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Unauthenticated");

    let url = args.url;
    if (!url && args.storageId) {
      url = await ctx.storage.getUrl(args.storageId) ?? undefined;
    }

    return await ctx.db.insert("assets", {
      title: args.title,
      type: args.type,
      url: url ?? "",
      storageId: args.storageId,
      tags: args.tags,
      storyId: args.storyId,
      uploadedBy: userId as unknown as string,
    });
  },
});
