import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const chapterSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  chapter: z.number(),
  part: z.number(),
  partTitle: z.string(),
  features: z.array(z.string()).default([]),
  icon: z.string().default('🌊'),
});

const chapters = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/chapters' }),
  schema: chapterSchema,
});

const chaptersHi = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/chapters-hi' }),
  schema: chapterSchema,
});

export const collections = { chapters, 'chapters-hi': chaptersHi };
