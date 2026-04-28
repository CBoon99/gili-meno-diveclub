import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const courses = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/courses' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    type: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ECO', 'PACKAGE']),
    price: z.number().optional(),
    duration: z.number().optional(),
    image: z.string().optional(),
    summary: z.string(),
    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
      })
      .optional(),
  }),
})

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    date: z.coerce.date(),
    image: z.string().optional(),
    summary: z.string(),
    tags: z.array(z.string()).optional(),
  }),
})

const diveSites = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/dive-sites' }),
  schema: z.object({
    name: z.string(),
    slug: z.string().optional(),
    maxDepth: z.number(),
    difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    lat: z.number(),
    lng: z.number(),
    image: z.string().optional(),
  }),
})

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/testimonials' }),
  schema: z.object({
    name: z.string(),
    source: z.enum(['Google', 'TripAdvisor', 'Email', 'Other']),
    rating: z.number().min(1).max(5),
    review: z.string(),
    date: z.coerce.date().optional(),
  }),
})

export const collections = { courses, blog, 'dive-sites': diveSites, testimonials }
