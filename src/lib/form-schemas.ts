import { z } from 'zod'

export const contactApiSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  email: z.string().min(1).max(320).email().trim(),
  phone: z.string().max(80).optional().nullable(),
  subject: z.string().min(1).max(80).trim(),
  message: z.string().min(1).max(12_000).trim(),
})

export const bookingApiSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  email: z.string().min(1).max(320).email().trim(),
  phone: z.string().max(80).optional().nullable(),
  divers: z.coerce.number().int().min(1).max(30),
  course: z.string().min(1).max(120).trim(),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
  certification: z.string().max(80).optional().nullable(),
  notes: z.string().max(12_000).optional().nullable(),
  consent: z.preprocess(
    (val) => val === true || val === 'on' || val === 'true' || val === 1,
    z.boolean(),
  ),
})

export const subscribeApiSchema = z.object({
  email: z.string().min(1).max(320).trim().email(),
})
