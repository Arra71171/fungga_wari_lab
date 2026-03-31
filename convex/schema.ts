// @convex-dev/auth removed — authentication is now handled by Clerk
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users are now synced from Clerk on first authenticated load
  users: defineTable({
    clerkId: v.optional(v.string()),            // Clerk user.id (identity.subject)
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    role: v.optional(v.string()),   // "admin" | "editor" | "viewer"
  }).index("by_clerk_id", ["clerkId"]),

  
  // High-level story metadata
  stories: defineTable({
    title: v.string(),
    description: v.optional(v.string()), // Summary of the story
    slug: v.string(),
    category: v.string(), // "creation_myth", "animal_fable", "historical", etc.
    language: v.string(), // e.g., "meitei", "english"
    status: v.string(),   // "draft", "in_translation", "in_illustration", "published_internally"
    coverImageUrl: v.optional(v.string()), // Can be a URL or ID from assets
    authorId: v.string(), // User ID who created the record
    tags: v.array(v.string()),
  }).index("by_slug", ["slug"]),

  // Chapters divide the story
  chapters: defineTable({
    storyId: v.id("stories"),
    title: v.string(),
    order: v.number(),
  }).index("by_storyId", ["storyId"]),

  // Scenes are the granular content pieces displayed in the Player/Editor
  scenes: defineTable({
    title: v.optional(v.string()),
    tiptapContent: v.optional(v.any()), // Structured JSON from Tiptap

    chapterId: v.id("chapters"),
    order: v.number(),

    // Authoring State
    isDraft: v.optional(v.boolean()),
    version: v.optional(v.number()),

    // Timestamps
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),

    // Presentation Metadata
    readingTime: v.optional(v.number()), // For cards/previews
    excerpt: v.optional(v.string()),     // Semantic preview
    illustrationUrl: v.optional(v.string()),
  }).index("by_chapterId", ["chapterId"]),

  // Branching choices linking scenes together
  choices: defineTable({
    sceneId: v.id("scenes"),
    label: v.string(),
    nextSceneId: v.id("scenes"),
  }).index("by_sceneId", ["sceneId"]),

  // The Asset Vault for illustrations, sketches, and references
  assets: defineTable({
    title: v.string(),
    url: v.string(),
    storageId: v.optional(v.id("_storage")),
    type: v.string(), // "illustration", "sketch", "reference_photo", "audio_lore"
    tags: v.array(v.string()),
    uploadedBy: v.string(), // User ID
    storyId: v.optional(v.id("stories")), // Optional linkage to a story
  }).index("by_type", ["type"]).index("by_storyId", ["storyId"]),

  // Team Kanban Tasks
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.any()), // Switched to v.any() for Tiptap JSON
    assigneeId: v.optional(v.string()), // User ID from TeamMembers/Auth
    status: v.string(), // "lore_gathering", "translating", "illustrating", "review", "done"
    priority: v.string(), // "low", "medium", "high"
    dueDate: v.optional(v.number()), // timestamp
    storyId: v.optional(v.id("stories")),
    sceneId: v.optional(v.id("scenes")),
  }).index("by_assigneeId", ["assigneeId"]).index("by_status", ["status"]),

  // Real-time Contextual Team Chat
  messages: defineTable({
    authorId: v.id("users"), // Replaced teamMembers with users
    content: v.string(),
    createdAt: v.number(),
    storyId: v.optional(v.id("stories")), // Chat scoped to a specific story
    sceneId: v.optional(v.id("scenes")), // Or specific scene
    taskId: v.optional(v.id("tasks")), // Or specific task
  }).index("by_storyId", ["storyId"]).index("by_taskId", ["taskId"]),
});
