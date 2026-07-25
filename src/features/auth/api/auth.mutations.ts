import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { parseApiError } from '~/shared/lib/api-error'
import { logger } from '~/shared/lib/logger'

import { loginFn, logoutFn, registerFn } from './auth.server'
import { authKeys } from './auth.queries'

import type { LoginRequest, RegisterRequest } from '~/contracts'

export interface AuthFieldError {
  field: string
  message: string
}

/** Distinguishes "map onto a field" from "show as a form-level message". */
export interface AuthMutationError {
  formError?: string
  fieldErrors: AuthFieldError[]
  clearPassword: boolean
}

function toAuthMutationError(error: unknown): AuthMutationError {
  const parsed = parseApiError(error)
  logger.error('auth.mutation', { code: parsed.code, status: parsed.status })

  if (parsed.code === 'validation_error' || parsed.code === 'conflict') {
    if (parsed.details && parsed.details.length > 0) {
      return { fieldErrors: parsed.details, clearPassword: false }
    }
    return { formError: parsed.message, fieldErrors: [], clearPassword: false }
  }

  if (parsed.code === 'unauthenticated') {
    // US-102: bad credentials are always a single generic message, password cleared.
    return {
      formError: 'Email or password is incorrect.',
      fieldErrors: [],
      clearPassword: true,
    }
  }

  return {
    formError: 'Something went wrong. Please try again.',
    fieldErrors: [],
    clearPassword: false,
  }
}

export function useRegister() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: RegisterRequest) => registerFn({ data: input }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.session() })
      queryClient.clear()
      // US-101: after register, always land on /pets.
      await navigate({ to: '/pets' })
    },
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  // Navigation (redirect param vs /pets) is decided by the caller (LoginForm),
  // since it depends on the route's `redirect` search param — the hook only
  // owns cache invalidation per doc02 §5.7's table.
  return useMutation({
    mutationFn: (input: LoginRequest) => loginFn({ data: input }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.session() })
      queryClient.clear()
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => logoutFn(),
    onSuccess: async () => {
      queryClient.clear()
      await navigate({ to: '/login' })
    },
  })
}

export { toAuthMutationError }
