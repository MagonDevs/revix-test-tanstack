import { randomUUID, createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { serverEnv } from '~/server/env.server'

import type {
  AgeGroup,
  PetStatus,
  RequestStatus,
  Sex,
  Size,
  Species,
} from '~/contracts'

// --- Stored entity shapes (internal vocabulary — mapped to DTOs in handlers) ---

export interface StoredPhoto {
  id: string
  url: string
  alt: string | null
  width: number
  height: number
}

export interface StoredUser {
  id: string
  name: string
  email: string
  passwordHash: string
  city: string
  avatarUrl: string | null
  bio: string | null
  phone: string | null
  createdAt: string
  updatedAt: string
}

export interface StoredSession {
  token: string
  userId: string
  createdAt: string
}

export interface StoredPet {
  id: string
  guardianId: string
  name: string
  species: Species
  breed: string | null
  sex: Sex
  ageMonths: number
  size: Size
  weightKg: number | null
  description: string
  photos: StoredPhoto[]
  city: string
  status: PetStatus
  isVaccinated: boolean
  isNeutered: boolean
  isGoodWithKids: boolean
  isGoodWithPets: boolean
  createdAt: string
  updatedAt: string
}

export interface StoredAdoptionRequest {
  id: string
  petId: string
  adopterId: string
  guardianId: string
  status: RequestStatus
  message: string
  createdAt: string
  updatedAt: string
  respondedAt: string | null
}

export interface StoredUpload {
  id: string
  url: string
  width: number
  height: number
  byteSize: number
  ownerId: string
  consumed: boolean
  createdAt: string
  updatedAt: string
}

export interface Db {
  users: Map<string, StoredUser>
  sessions: Map<string, StoredSession>
  pets: Map<string, StoredPet>
  adoptionRequests: Map<string, StoredAdoptionRequest>
  /** Keyed by `${userId}:${petId}` — a Set would lose the timestamp, and order doesn't matter. */
  favourites: Map<string, { userId: string; petId: string; createdAt: string }>
  uploads: Map<string, StoredUpload>
}

function emptyDb(): Db {
  return {
    users: new Map(),
    sessions: new Map(),
    pets: new Map(),
    adoptionRequests: new Map(),
    favourites: new Map(),
    uploads: new Map(),
  }
}

// Module-level store — the whole point of a fake backend inside the same process.
export let db: Db = emptyDb()

const PERSIST_PATH = resolve(process.cwd(), '.mock-db.json')

function serialize(): string {
  return JSON.stringify({
    users: [...db.users.values()],
    sessions: [...db.sessions.values()],
    pets: [...db.pets.values()],
    adoptionRequests: [...db.adoptionRequests.values()],
    favourites: [...db.favourites.values()],
    uploads: [...db.uploads.values()],
  })
}

export function persist(): void {
  if (!serverEnv.MOCK_PERSIST) return
  try {
    writeFileSync(PERSIST_PATH, serialize(), 'utf-8')
  } catch {
    // Best-effort dev convenience only — never let persistence failures break a request.
  }
}

export function loadPersisted(): boolean {
  if (!serverEnv.MOCK_PERSIST || !existsSync(PERSIST_PATH)) return false
  try {
    const raw = JSON.parse(readFileSync(PERSIST_PATH, 'utf-8')) as {
      users: StoredUser[]
      sessions: StoredSession[]
      pets: StoredPet[]
      adoptionRequests: StoredAdoptionRequest[]
      favourites: { userId: string; petId: string; createdAt: string }[]
      uploads: StoredUpload[]
    }
    const next = emptyDb()
    for (const u of raw.users) next.users.set(u.id, u)
    for (const s of raw.sessions) next.sessions.set(s.token, s)
    for (const p of raw.pets) next.pets.set(p.id, p)
    for (const r of raw.adoptionRequests) next.adoptionRequests.set(r.id, r)
    for (const f of raw.favourites)
      next.favourites.set(`${f.userId}:${f.petId}`, f)
    for (const up of raw.uploads) next.uploads.set(up.id, up)
    db = next
    return true
  } catch {
    return false
  }
}

export function resetDb(next: Db): void {
  db = next
  persist()
}

/**
 * Raw upload bytes, kept out of the persisted `Db` (they'd bloat `.mock-db.json` and aren't
 * needed to prove the contract) — served back by `/uploads/:id/raw`.
 */
export const uploadBytes = new Map<
  string,
  { bytes: ArrayBuffer; contentType: string }
>()

export function newId(): string {
  return randomUUID()
}

export function nowIso(): string {
  return new Date().toISOString()
}

/** Explicitly NOT real security — a salted sha256 is only enough to make the login path exercise real comparisons. */
export function hashPassword(password: string): string {
  return createHash('sha256').update(`adopta-mock:${password}`).digest('hex')
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

/** Bumps updatedAt and persists. Every write to a collection should go through this. */
export function mutate<T extends { updatedAt: string }>(
  map: Map<string, T>,
  id: string,
  updater: (current: T) => T,
): T {
  const current = map.get(id)
  if (!current) throw new Error(`mutate: no entity with id ${id}`)
  const next = { ...updater(current), updatedAt: nowIso() }
  map.set(id, next)
  persist()
  return next
}

export function insert<T>(map: Map<string, T>, id: string, value: T): T {
  map.set(id, value)
  persist()
  return value
}

export function remove(map: Map<string, unknown>, id: string): void {
  map.delete(id)
  persist()
}

export const AGE_GROUP_MONTHS: Record<AgeGroup, [number, number]> = {
  baby: [0, 5],
  young: [6, 23],
  adult: [24, 95],
  senior: [96, 360],
}
