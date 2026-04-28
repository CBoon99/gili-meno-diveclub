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
    imageAlt: z.string().optional(),
    summary: z.string(),
    /** SSI cert awarded on completion (e.g. "SSI Open Water Diver"). */
    credential: z.string().optional(),
    /** Plain-text prerequisites (e.g. "Age 10+, basic swimming"). */
    prerequisites: z.array(z.string()).optional(),
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
    imageAlt: z.string().optional(),
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
    imageAlt: z.string().optional(),
  }),
})

const regions = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/regions' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
      })
      .optional(),
  }),
})

const marineLife = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/marine-life' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    summary: z.string(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    species: z.array(z.string()).optional(),
    bestSites: z.array(z.string()).optional(),
  }),
})

const audiences = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/audiences' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    summary: z.string(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
})

const info = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/info' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    summary: z.string(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
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

export const collections = {
  courses,
  blog,
  'dive-sites': diveSites,
  regions,
  'marine-life': marineLife,
  audiences,
  info,
  testimonials,
}
