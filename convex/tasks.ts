import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Unauthenticated");

    return await ctx.db.query("tasks").order("desc").collect();
  },
});

export const getTeamMembers = query({
  args: {},
  handler: async (ctx) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Unauthenticated");

    const users = await ctx.db.query("users").collect();
    // Map clerkId to userId to maintain compatibility with existing Team Kanban components
    return users.map(u => ({ ...u, userId: u.clerkId || u._id }));
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.any()),
    assigneeId: v.optional(v.string()),
    status: v.string(),
    priority: v.string(),
    dueDate: v.optional(v.number()),
    storyId: v.optional(v.id("stories")),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Unauthenticated");

    return await ctx.db.insert("tasks", {
      ...args,
    });
  },
});

export const updateStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Unauthenticated");

    await ctx.db.patch(args.taskId, {
      status: args.status,
    });
  },
});

export const updateDetails = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.any()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    assigneeId: v.optional(v.string()),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Unauthenticated");

    const patch: any = {};
    if (args.title !== undefined) patch.title = args.title;
    if (args.description !== undefined) patch.description = args.description;
    if (args.status !== undefined) patch.status = args.status;
    if (args.priority !== undefined) patch.priority = args.priority;
    if (args.assigneeId !== undefined) patch.assigneeId = args.assigneeId;
    if (args.dueDate !== undefined) patch.dueDate = args.dueDate;
    
    await ctx.db.patch(args.taskId, patch);
  },
});

export const remove = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Unauthenticated");

    await ctx.db.delete(args.taskId);
  },
});
