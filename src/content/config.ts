import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z
      .string()
      .or(z.date())
      .transform((val) =>
        new Date(val).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      ),
    tags: z.array(z.string()),
    cover: z.string(),
    author: z.string(),
    authorUsername: z.string(),
    authorLinkedIn: z.string().optional(),
    thumbnailText: z.string().optional(),
    words: z.array(z.string()).default([]),
    modelConfig: z.object({
      visualization: z.string(),
      contextGathering: z.array(z.string()),
      workflow: z.object({
        synthesis: z.string(),
        correction: z.string(),
        humanization: z.string(),
      }),
    }),
  }),
});

export const collections = { blog };
