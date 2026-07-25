import { ApiError } from '~/server/api-client/api-error'

import { toSessionUserDto } from '../mappers'
import {
  db,
  hashPassword,
  insert,
  newId,
  nowIso,
  verifyPassword,
} from '../repository'
import { jsonResponse, noContentResponse, readJsonBody } from '../response'
import {
  clearCookieHeader,
  createSession,
  currentUser,
  destroySession,
  setCookieHeader,
} from '../session'
import { parseOrThrow } from '../validation'

import { loginRequestSchema, registerRequestSchema } from '~/contracts'

export async function register(ctx: { request: Request }): Promise<Response> {
  const { name, email, password, city } = parseOrThrow(
    registerRequestSchema,
    await readJsonBody(ctx.request),
    'The account could not be created.',
  )

  const existing = [...db.users.values()].find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  )
  if (existing) {
    throw ApiError.create(
      409,
      'conflict',
      'An account with this email already exists.',
      [{ field: 'email', message: 'This email is already registered.' }],
    )
  }

  const id = newId()
  const createdAt = nowIso()
  const user = insert(db.users, id, {
    id,
    name,
    email,
    passwordHash: hashPassword(password),
    city,
    avatarUrl: null,
    bio: null,
    phone: null,
    createdAt,
    updatedAt: createdAt,
  })

  const token = createSession(user.id)
  return jsonResponse(toSessionUserDto(user), 201, {
    'set-cookie': setCookieHeader(token),
  })
}

export async function login(ctx: { request: Request }): Promise<Response> {
  const parsed = loginRequestSchema.safeParse(await readJsonBody(ctx.request))
  if (!parsed.success) {
    throw ApiError.create(
      401,
      'unauthenticated',
      'Incorrect email or password.',
    )
  }
  const { email, password } = parsed.data

  const user = [...db.users.values()].find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  )
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw ApiError.create(
      401,
      'unauthenticated',
      'Incorrect email or password.',
    )
  }

  const token = createSession(user.id)
  return jsonResponse(toSessionUserDto(user), 200, {
    'set-cookie': setCookieHeader(token),
  })
}

export function logout(ctx: { request: Request }): Response {
  destroySession(ctx.request)
  return noContentResponse({ 'set-cookie': clearCookieHeader() })
}

export function getSession(ctx: { request: Request }): Response {
  const user = currentUser(ctx.request)
  if (!user) throw ApiError.create(401, 'unauthenticated', 'No active session.')
  return jsonResponse(toSessionUserDto(user))
}
