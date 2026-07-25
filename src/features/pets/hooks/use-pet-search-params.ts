import { useNavigate } from '@tanstack/react-router'

import type { PetSearch } from '../schemas/pet-search.schema'

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
