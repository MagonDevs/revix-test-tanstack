import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { requestKeys } from '~/features/adoption-requests/api/adoption-requests.queries'

import { reportMutationError } from '~/shared/lib/report-mutation-error'
import { toast } from '~/shared/ui/toast'

import {
  createPetFn,
  deletePetFn,
  updatePetFn,
  updatePetStatusFn,
  uploadPhotoFn,
} from './pets.serverfns'
import { petKeys } from './pets.queries'

import type { Pet } from '../model/pet.model'
import type {
  CreatePetRequest,
  OwnedPetDto,
  UpdatePetRequest,
  UpdatePetStatusRequest,
  UploadDto,
} from '~/contracts'

interface MutationFormLike {
  setErrorMap: (map: {
    onSubmit: { form?: string; fields: Record<string, string> }
  }) => void
}

export function useUploadPhoto() {
  return useMutation({
    mutationFn: async (file: File): Promise<UploadDto> => {
      const formData = new FormData()
      formData.append('file', file)
      return uploadPhotoFn({ data: formData })
    },
    onError: (error) => reportMutationError(error),
  })
}

export function useCreatePet(form?: MutationFormLike) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: CreatePetRequest) => createPetFn({ data: input }),
    onSuccess: async (pet: Pet) => {
      await queryClient.invalidateQueries({ queryKey: petKeys.lists() })
      await queryClient.invalidateQueries({ queryKey: petKeys.mine() })
      toast.success(`${pet.name} is published`)
      await navigate({ to: '/dashboard/pets' })
    },
    onError: (error) => reportMutationError(error, form ? { form } : {}),
  })
}

export function useUpdatePet(petId: string, form?: MutationFormLike) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: UpdatePetRequest) =>
      updatePetFn({ data: { petId, body: input } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: petKeys.detail(petId) })
      await queryClient.invalidateQueries({ queryKey: petKeys.lists() })
      await queryClient.invalidateQueries({ queryKey: petKeys.mine() })
      toast.success('Save changes')
      await navigate({ to: '/dashboard/pets' })
    },
    onError: (error) => reportMutationError(error, form ? { form } : {}),
  })
}

export function useUpdatePetStatus(petId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdatePetStatusRequest) =>
      updatePetStatusFn({ data: { petId, body: input } }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: petKeys.detail(petId) })
      await queryClient.cancelQueries({ queryKey: petKeys.mine() })

      const previousDetail = queryClient.getQueryData(petKeys.detail(petId))
      const previousMineQueries = queryClient.getQueriesData<{
        items: OwnedPetDto[]
        meta: unknown
      }>({ queryKey: petKeys.mine() })

      queryClient.setQueryData<Pet | undefined>(petKeys.detail(petId), (old) =>
        old ? { ...old, status: input.status } : old,
      )
      for (const [key, data] of previousMineQueries) {
        if (!data) continue
        queryClient.setQueryData(key, {
          ...data,
          items: data.items.map((pet) =>
            pet.id === petId ? { ...pet, status: input.status } : pet,
          ),
        })
      }

      return { previousDetail, previousMineQueries }
    },
    onError: (error, _input, context) => {
      if (context) {
        queryClient.setQueryData(petKeys.detail(petId), context.previousDetail)
        for (const [key, data] of context.previousMineQueries) {
          queryClient.setQueryData(key, data)
        }
      }
      reportMutationError(error)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: petKeys.detail(petId) })
      await queryClient.invalidateQueries({ queryKey: petKeys.mine() })
      await queryClient.invalidateQueries({ queryKey: requestKeys.received() })
    },
  })
}

export function useDeletePet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (petId: string) => deletePetFn({ data: { petId } }),
    onMutate: async (petId) => {
      await queryClient.cancelQueries({ queryKey: petKeys.mine() })
      const previousMineQueries = queryClient.getQueriesData<{
        items: OwnedPetDto[]
        meta: unknown
      }>({ queryKey: petKeys.mine() })

      for (const [key, data] of previousMineQueries) {
        if (!data) continue
        queryClient.setQueryData(key, {
          ...data,
          items: data.items.filter((pet) => pet.id !== petId),
        })
      }

      return { previousMineQueries }
    },
    onError: (error, _petId, context) => {
      if (context) {
        for (const [key, data] of context.previousMineQueries) {
          queryClient.setQueryData(key, data)
        }
      }
      reportMutationError(error)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: petKeys.mine() })
      await queryClient.invalidateQueries({ queryKey: petKeys.lists() })
    },
  })
}
