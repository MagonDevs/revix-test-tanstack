import { ApiError } from '~/server/api-client/api-error'

import { currentUser } from './session'

import type { StoredUser } from './repository'

export function requireAuth(request: Request): StoredUser {
  const user = currentUser(request)
  if (!user) throw ApiError.create(401, 'unauthenticated', 'Sign in required.')
  return user
}
