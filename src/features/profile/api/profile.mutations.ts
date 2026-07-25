import { useMutation, useQueryClient } from '@tanstack/react-query'

import { authKeys } from '~/features/auth'
import { userKeys } from '~/features/pets'

import { reportMutationError } from '~/shared/lib/report-mutation-error'
import { toast } from '~/shared/ui/toast'

import { updateProfileFn } from './profile.serverfns'

import type { SessionUserDto, UpdateUserRequest } from '~/contracts'

interface MutationFormLike {
  setErrorMap: (map: {
    onSubmit: { form?: string; fields: Record<string, string> }
  }) => void
}

export function useUpdateProfile(form?: MutationFormLike) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateUserRequest) => updateProfileFn({ data: input }),
    onSuccess: async (user: SessionUserDto) => {
      await queryClient.invalidateQueries({ queryKey: authKeys.session() })
      await queryClient.invalidateQueries({
        queryKey: userKeys.detail(user.id),
      })
      toast.success('Profile saved')
    },
    onError: (error) => reportMutationError(error, form ? { form } : {}),
  })
}
