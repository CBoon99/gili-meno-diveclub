import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

import * as schema from './schema'

let _db: ReturnType<typeof drizzle<typeof schema>> | undefined

export function getDb() {
  const url = process.env.DATABASE_URL
  if (!url || url.length < 10) return null

  if (!_db) {
    const sql = neon(url)
    _db = drizzle(sql, { schema })
  }
  return _db
}

export type DbClient = NonNullable<ReturnType<typeof getDb>>

export * from './schema'
