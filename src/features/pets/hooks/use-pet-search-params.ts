import { useNavigate } from '@tanstack/react-router'

import type { PetSearch } from '../schemas/pet-search.schema'

/**
 * Single place that patches the pet-browse URL search params. Any filter
 * change resets `page` to 1 — that rule lives here exactly once, per
 * doc02 §6.1.
 */
export function useUpdatePetSearch() {
  const navigate = useNavigate({ from: '/pets/' })

  return (patch: Partial<Omit<PetSearch, 'page'>> & { page?: number }) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
        page: patch.page ?? 1,
      }),
    })
  }
}
