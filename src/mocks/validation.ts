import { ApiError } from '~/server/api-client/api-error'

import type { FieldError } from '~/contracts'
import type { z } from 'zod'

export function parseOrThrow<T extends z.ZodTypeAny>(
  schema: T,
  body: unknown,
  message = 'The request could not be validated.',
): z.infer<T> {
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const details: FieldError[] = parsed.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'root',
      message: issue.message,
    }))
    throw ApiError.create(422, 'validation_error', message, details)
  }
  return parsed.data
}
