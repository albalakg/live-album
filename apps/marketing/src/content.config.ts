import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const section = z.object({
  level: z.number(),
  heading: z.string().nullable(),
  paragraphs: z.array(z.string()).optional(),
  bullets: z.array(z.string()).optional(),
});

const landing = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/landing" }),
  schema: z.object({
    slug: z.string(),
    primaryKeyword: z.string(),
    title: z.string(),
    metaDescription: z.string(),
    h1: z.string(),
    breadcrumbLabel: z.string(),
    ctaTarget: z.string(),
    sections: z.array(section),
    faq: z.array(z.object({ q: z.string(), a: z.string() })),
    internalLinks: z.array(z.object({ slug: z.string(), anchor: z.string() })),
    schemaTypes: z.array(z.string()).optional(),
    secondaryKeywords: z.array(z.string()).optional(),
    searchIntent: z.string().optional(),
    priority: z.union([z.number(), z.string()]).optional(),
    role: z.string().optional(),
    ogImageSuggestion: z.string().optional(),
    wordCount: z.number().optional(),
    titleLength: z.number().optional(),
    metaLength: z.number().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { landing, blog };
