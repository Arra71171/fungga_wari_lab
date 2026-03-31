import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * generateUploadUrl — returns a short-lived upload URL for Convex Storage.
 * The client POSTs the file directly to this URL, then calls confirmUpload.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Unauthenticated");

    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * confirmUpload — takes the storageId returned after a successful upload,
 * persists it to the assets table, and returns the public URL.
 */
export const confirmUpload = mutation({
  args: {
    storageId: v.id("_storage"),
    title: v.optional(v.string()),
    type: v.optional(v.string()),   // "illustration" | "sketch" | "reference_photo"
    storyId: v.optional(v.id("stories")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Upload failed — no URL returned");

    await ctx.db.insert("assets", {
      title: args.title ?? "Untitled Asset",
      url,
      storageId: args.storageId,
      type: args.type ?? "illustration",
      tags: [],
      uploadedBy: identity.subject,
      storyId: args.storyId,
    });

    return url;
  },
});

/**
 * getFileUrl — query to get a public URL for a stored file.
 */
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
