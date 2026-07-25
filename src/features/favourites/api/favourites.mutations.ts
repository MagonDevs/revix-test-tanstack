import { useMutation, useQueryClient } from '@tanstack/react-query'

import { petKeys } from '~/features/pets/api/pets.queries'
import type { Pet } from '~/features/pets/model/pet.model'

import { reportMutationError } from '~/shared/lib/report-mutation-error'

import { addFavouriteFn, removeFavouriteFn } from './favourites.server'
import { favouriteKeys } from './favourites.queries'

interface FavouritesPage {
  items: Pet[]
  meta: unknown
}

export interface ToggleFavouriteInput {
  petId: string
  /** Whether the pet is favourited *before* this toggle. */
  isFavourited: boolean
}

/**
 * One hook toggles both directions — add when not favourited, remove when
 * favourited — since PUT is idempotent per doc03 §3.7 either is safe to
 * retry. Optimistic per doc02 §5.7: patches `petKeys.detail(petId)`'s cached
 * `isFavourited` in place and best-effort patches any cached
 * `favouriteKeys.list()` pages (removing on unfavourite always; adding on
 * favourite only when the full `Pet` is already in the detail cache — the
 * list page itself may not be loaded, and this mutation only has a petId to
 * work with). Snapshot -> rollback -> settle mirrors
 * `useRespondToRequest`/`useUpdatePetStatus`.
 */
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
          // Unfavouriting: drop the pet from every cached favourites page.
          queryClient.setQueryData(key, {
            ...data,
            items: data.items.filter((pet) => pet.id !== petId),
          })
          continue
        }
        // Favouriting: only inject the pet if we already have its full
        // shape (from the detail cache) and it isn't already listed.
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
