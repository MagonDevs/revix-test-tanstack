import { z } from 'zod'

export const idSchema = z.string().uuid()
export const isoDateTimeSchema = z.string().datetime({ offset: true })

export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  perPage: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

export function paginatedSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({ items: z.array(item), meta: paginationMetaSchema })
}

export const fieldErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
})

export const apiErrorCodeSchema = z.enum([
  'validation_error',
  'unauthenticated',
  'forbidden',
  'not_found',
  'conflict',
  'rate_limited',
  'internal_error',
])

export const apiErrorBodySchema = z.object({
  error: z.object({
    code: apiErrorCodeSchema,
    message: z.string(),
    details: z.array(fieldErrorSchema).optional(),
  }),
})

export type PaginationMeta = z.infer<typeof paginationMetaSchema>
export type FieldError = z.infer<typeof fieldErrorSchema>
export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>
export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>
