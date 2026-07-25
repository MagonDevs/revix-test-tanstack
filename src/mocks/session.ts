import { db, newId, nowIso, type StoredUser } from './repository'

export const SESSION_COOKIE_NAME = 'adopta_session'
const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30

export function readSessionToken(request: Request): string | null {
  const cookie = request.headers.get('cookie')
  if (!cookie) return null
  const entry = cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`))
  return entry
    ? decodeURIComponent(entry.slice(SESSION_COOKIE_NAME.length + 1))
    : null
}

export function currentUser(request: Request): StoredUser | null {
  const token = readSessionToken(request)
  if (!token) return null
  const session = db.sessions.get(token)
  if (!session) return null
  return db.users.get(session.userId) ?? null
}

export function createSession(userId: string): string {
  const token = newId()
  db.sessions.set(token, { token, userId, createdAt: nowIso() })
  return token
}

export function destroySession(request: Request): void {
  const token = readSessionToken(request)
  if (token) db.sessions.delete(token)
}

/** httpOnly, SameSite=Lax, Secure in production, 30-day expiry — matches doc03 §1. */
export function setCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; Max-Age=${THIRTY_DAYS_SECONDS}; HttpOnly; SameSite=Lax${secure}`
}

export function clearCookieHeader(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`
}
