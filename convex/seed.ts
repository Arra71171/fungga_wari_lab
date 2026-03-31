import { mutation } from "./_generated/server";

export const populate = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Create a dummy author
    const authorId = await ctx.db.insert("teamMembers", {
      userId: "dummy-user-123",
      role: "admin",
      name: "Wise Grandparent",
    });

    // 2. Clear existing (idempotent cascade)
    const existingStories = await ctx.db.query("stories").take(200);
    for (const story of existingStories) {
      const chapters = await ctx.db
        .query("chapters")
        .withIndex("by_storyId", (q) => q.eq("storyId", story._id))
        .collect();
      for (const chapter of chapters) {
        const scenes = await ctx.db
          .query("scenes")
          .withIndex("by_chapterId", (q) => q.eq("chapterId", chapter._id))
          .collect();
        for (const scene of scenes) {
          const choices = await ctx.db
            .query("choices")
            .withIndex("by_sceneId", (q) => q.eq("sceneId", scene._id))
            .collect();
          for (const choice of choices) {
            await ctx.db.delete(choice._id);
          }
          await ctx.db.delete(scene._id);
        }
        await ctx.db.delete(chapter._id);
      }
      await ctx.db.delete(story._id);
    }

    // 3. Create stories
    const storyId = await ctx.db.insert("stories", {
      title: "The Tiger and the Golden Pheasant",
      slug: "tiger-and-golden-pheasant",
      category: "folk",
      language: "meitei",
      status: "published",
      authorId: authorId as unknown as string,
      coverImageUrl:
        "https://images.unsplash.com/photo-1571217666993-4a625caeed1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      tags: ["tiger", "forest", "folklore"],
    });

    await ctx.db.insert("stories", {
      title: "Khamba and Thoibi",
      slug: "khamba-and-thoibi",
      category: "legend",
      language: "meitei",
      status: "published",
      authorId: authorId as unknown as string,
      coverImageUrl:
        "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      tags: ["epic", "romance", "hero"],
    });

    // 4. Create chapters & scenes
    const chapter1 = await ctx.db.insert("chapters", {
      storyId,
      title: "Deep in the Wilds",
      order: 1,
    });

    const scene1 = await ctx.db.insert("scenes", {
      chapterId: chapter1,
      order: 1,
      tiptapContent: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Long ago, in the dense forests of Kangleipak, lived a boastful Tiger who claimed to be the undisputed king of the woods.",
              },
            ],
          },
          {
            type: "blockquote",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "None can match my speed, my strength, or my beauty. I am the pinnacle of creation! - Tiger",
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    const scene2 = await ctx.db.insert("scenes", {
      chapterId: chapter1,
      order: 2,
      tiptapContent: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "One evening, the Tiger encountered a Golden Pheasant, its feathers shimmering like spun fire in the fading sunlight.",
              },
            ],
          },
          {
            type: "blockquote",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Beware, Oh mighty one! Pride is often the hunter that catches us unaware. - Pheasant",
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    // 5. Link scenes with a choice
    await ctx.db.insert("choices", {
      sceneId: scene1,
      label: "Continue down the path",
      nextSceneId: scene2,
    });

    return "Database seeded successfully!";
  },
});
