import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Unauthenticated");

    // Get the last 50 messages
    const messages = await ctx.db
      .query("messages")
      .order("desc")
      .take(50);
      
    // Join with teamMembers to get author details
    // Need to reverse so they display in chronological order
    const reversed = messages.reverse();
    
    // We mock the author if we don't have the real teamMember yet, to match getCurrent
    const enriched = await Promise.all(
      reversed.map(async (msg) => {
        let author = null;
        if (msg.authorId !== "mock_id" as any) {
           author = await ctx.db.get(msg.authorId);
        }
        
        return {
          ...msg,
          author: author || {
            name: "Unknown Member",
            avatarUrl: "/avatars/default.png"
          }
        };
      })
    );
    
    return enriched;
  },
});

export const send = mutation({
  args: {
    content: v.string(),
    authorId: v.id("teamMembers"), 
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Unauthenticated");
    
    let realAuthorId = args.authorId;
    
    const existing = await ctx.db
      .query("teamMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
      
    if (existing) {
      realAuthorId = existing._id as any;
    } else {
      realAuthorId = await ctx.db.insert("teamMembers", {
        userId: userId,
        role: "viewer",
        name: "Unknown User",
        avatarUrl: "/avatars/default.png",
      });
    }

    return await ctx.db.insert("messages", {
      content: args.content,
      authorId: realAuthorId,
      createdAt: Date.now(),
    });
  },
});
