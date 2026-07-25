import { loadPersisted, resetDb } from './repository'
import { seedDb } from './seed'

let initialized = false

/** Idempotent — the first request of the process seeds the in-memory store (or restores `.mock-db.json`). */
export function ensureSeeded(): void {
  if (initialized) return
  initialized = true
  if (!loadPersisted()) resetDb(seedDb())
}
