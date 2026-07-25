import type { PaginationMeta } from '~/contracts'

export function parsePageParams(search: URLSearchParams): {
  page: number
  perPage: number
} {
  const page = Math.max(1, Number(search.get('page') ?? '1') || 1)
  const perPage = Math.min(
    48,
    Math.max(1, Number(search.get('perPage') ?? '12') || 12),
  )
  return { page, perPage }
}

export function paginate<T>(
  all: T[],
  page: number,
  perPage: number,
): { items: T[]; meta: PaginationMeta } {
  const total = all.length
  const totalPages = Math.max(0, Math.ceil(total / perPage))
  const start = (page - 1) * perPage
  const items = all.slice(start, start + perPage)
  return { items, meta: { page, perPage, total, totalPages } }
}
