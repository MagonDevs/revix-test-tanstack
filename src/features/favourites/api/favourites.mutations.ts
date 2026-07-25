import { useMutation, useQueryClient } from '@tanstack/react-query'

import { petKeys } from '~/features/pets'
import type { Pet } from '~/features/pets'

import { reportMutationError } from '~/shared/lib/report-mutation-error'

import { addFavouriteFn, removeFavouriteFn } from './favourites.serverfns'
import { favouriteKeys } from './favourites.queries'

interface FavouritesPage {
  items: Pet[]
  meta: unknown
}

export interface ToggleFavouriteInput {
  petId: string
  isFavourited: boolean
}

export function useToggleFavourite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ petId, isFavourited }: ToggleFavouriteInput) =>
      isFavourited
        ? removeFavouriteFn({ data: { petId } })
        : addFavouriteFn({ data: { petId } }),
    onMutate: async ({ petId, isFavourited }) => {
      const next = !isFavourited

      await queryClient.cancelQueries({ queryKey: petKeys.detail(petId) })
      await queryClient.cancelQueries({ queryKey: favouriteKeys.lists() })

      const previousDetail = queryClient.getQueryData<Pet | undefined>(
        petKeys.detail(petId),
      )
      const previousFavouriteQueries =
        queryClient.getQueriesData<FavouritesPage>({
          queryKey: favouriteKeys.lists(),
        })

      queryClient.setQueryData<Pet | undefined>(petKeys.detail(petId), (old) =>
        old ? { ...old, isFavourited: next } : old,
      )

      for (const [key, data] of previousFavouriteQueries) {
        if (!data) continue
        if (!next) {
          queryClient.setQueryData(key, {
            ...data,
            items: data.items.filter((pet) => pet.id !== petId),
          })
          continue
        }
        if (previousDetail && !data.items.some((pet) => pet.id === petId)) {
          queryClient.setQueryData(key, {
            ...data,
            items: [{ ...previousDetail, isFavourited: true }, ...data.items],
          })
        }
      }

      return { previousDetail, previousFavouriteQueries }
    },
    onError: (error, _input, context) => {
      if (context) {
        queryClient.setQueryData(
          petKeys.detail(_input.petId),
          context.previousDetail,
        )
        for (const [key, data] of context.previousFavouriteQueries) {
          queryClient.setQueryData(key, data)
        }
      }
      reportMutationError(error)
    },
    onSettled: async (_data, _error, { petId }) => {
      await queryClient.invalidateQueries({ queryKey: favouriteKeys.lists() })
      await queryClient.invalidateQueries({ queryKey: petKeys.detail(petId) })
    },
  })
}
