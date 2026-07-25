import { loadPersisted, resetDb } from './repository'
import { seedDb } from './seed'

let initialized = false

export function ensureSeeded(): void {
  if (initialized) return
  initialized = true
  if (!loadPersisted()) resetDb(seedDb())
}
