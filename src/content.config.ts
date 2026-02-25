import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const chapters = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/chapters' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    chapter: z.number(),
    part: z.number(),
    partTitle: z.string(),
    features: z.array(z.string()).default([]),
    icon: z.string().default('🌊'),
  }),
});

export const collections = { chapters };
