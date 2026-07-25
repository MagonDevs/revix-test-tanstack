import { useMutation, useQueryClient } from '@tanstack/react-query'

import { petKeys } from '~/features/pets'

import { reportMutationError } from '~/shared/lib/report-mutation-error'
import { toast } from '~/shared/ui/toast'

import {
  createAdoptionRequestFn,
  respondToRequestFn,
  withdrawRequestFn,
} from './adoption-requests.serverfns'
import { requestKeys } from './adoption-requests.queries'

import type { AdoptionRequest } from '../model/adoption-request.model'
import type {
  CreateAdoptionRequestRequest,
  RespondToRequestRequest,
} from '~/contracts'

export function useCreateRequest(petId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateAdoptionRequestRequest) =>
      createAdoptionRequestFn({ data: { petId, body: input } }),
    onSuccess: async (request: AdoptionRequest) => {
      await queryClient.invalidateQueries({ queryKey: requestKeys.sent() })
      await queryClient.invalidateQueries({ queryKey: petKeys.detail(petId) })
      toast.success(`Request sent to ${request.guardian.name}`)
    },
    onError: (error) => reportMutationError(error),
  })
}

export function useRespondToRequest(requestId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: RespondToRequestRequest) =>
      respondToRequestFn({ data: { requestId, body: input } }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: requestKeys.received() })
      const previousQueries = queryClient.getQueriesData<{
        items: AdoptionRequest[]
        meta: unknown
      }>({ queryKey: requestKeys.received() })

      for (const [key, data] of previousQueries) {
        if (!data) continue
        queryClient.setQueryData(key, {
          ...data,
          items: data.items.map((request) =>
            request.id === requestId
              ? { ...request, status: input.status }
              : request,
          ),
        })
      }

      return { previousQueries }
    },
    onSuccess: (_data, input) => {
      toast.success(
        input.status === 'accepted' ? 'Request accepted' : 'Request declined',
      )
    },
    onError: (error, _input, context) => {
      if (context) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data)
        }
      }
      reportMutationError(error)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: requestKeys.received() })
      await queryClient.invalidateQueries({ queryKey: petKeys.mine() })
    },
  })
}

export function useWithdrawRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestId: string) =>
      withdrawRequestFn({ data: { requestId } }),
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: requestKeys.sent() })
      const previousQueries = queryClient.getQueriesData<{
        items: AdoptionRequest[]
        meta: unknown
      }>({ queryKey: requestKeys.sent() })

      for (const [key, data] of previousQueries) {
        if (!data) continue
        queryClient.setQueryData(key, {
          ...data,
          items: data.items.map((request) =>
            request.id === requestId
              ? { ...request, status: 'withdrawn' as const }
              : request,
          ),
        })
      }

      return { previousQueries }
    },
    onSuccess: () => toast.success('Request withdrawn'),
    onError: (error, _requestId, context) => {
      if (context) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data)
        }
      }
      reportMutationError(error)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: requestKeys.sent() })
    },
  })
}
