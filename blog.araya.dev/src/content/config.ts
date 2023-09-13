import { defineCollection, z } from "astro:content";
const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()).nullable().optional(),
    date: z.string().optional(),
    description: z.string().optional(),
    draft: z.boolean().optional(),
    thumbnail: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
