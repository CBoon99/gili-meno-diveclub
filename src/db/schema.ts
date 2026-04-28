import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const contacts = pgTable('contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  /** `api` = direct POST; `netlify` = form webhook */
  source: text('source').notNull().default('api'),
  /** Dedup Netlify submission-created webhooks */
  netlifySubmissionId: text('netlify_submission_id').unique(),
})

export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  divers: integer('divers').notNull(),
  course: text('course').notNull(),
  preferredDate: text('preferred_date').notNull(),
  certification: text('certification'),
  notes: text('notes'),
  consent: boolean('consent').notNull().default(false),
  source: text('source').notNull().default('api'),
  netlifySubmissionId: text('netlify_submission_id').unique(),
})

export const subscribers = pgTable('subscribers', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  email: text('email').notNull().unique(),
  source: text('source').notNull().default('api'),
})

export type ContactRow = typeof contacts.$inferSelect
export type BookingRow = typeof bookings.$inferSelect
