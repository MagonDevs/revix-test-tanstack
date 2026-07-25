import { queryOptions } from '@tanstack/react-query'

import { getFavouritesFn } from './favourites.server'

export const favouriteKeys = {
  all: ['favourites'] as const,
  lists: () => [...favouriteKeys.all, 'list'] as const,
  list: (query: { page?: number; perPage?: number }) =>
    [...favouriteKeys.lists(), query] as const,
} as const

export const favouritesQuery = (
  query: { page?: number; perPage?: number } = {},
) => {
  const full = { page: 1, perPage: 12, ...query }
  return queryOptions({
    queryKey: favouriteKeys.list(full),
    queryFn: () => getFavouritesFn({ data: full }),
  })
}
