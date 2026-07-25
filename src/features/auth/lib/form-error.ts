/** TanStack Form's `errors`/`errorMap` entries can be a string or a `{ message }` object. */
export function toMessage(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'string') return value
  if (
    typeof value === 'object' &&
    'message' in value &&
    typeof value.message === 'string'
  ) {
    return (value as { message: string }).message
  }
  return undefined
}
