import { useMutation, useQueryClient } from '@tanstack/react-query'

import { authKeys } from '~/features/auth'
import { userKeys } from '~/features/pets/api/pets.queries'

import { reportMutationError } from '~/shared/lib/report-mutation-error'
import { toast } from '~/shared/ui/toast'

import { updateProfileFn } from './profile.serverfns'

import type { SessionUserDto, UpdateUserRequest } from '~/contracts'

interface MutationFormLike {
  setErrorMap: (map: {
    onSubmit: { form?: string; fields: Record<string, string> }
  }) => void
}

/**
 * Not optimistic — per doc02 §5.7's mutation table `updateProfile` invalidates
 * `authKeys.session()` + `userKeys.detail(me)` on success rather than
 * patching in place, since the header, dashboard, and public profile all
 * read the session/user queries directly and a fresh fetch keeps them in
 * sync without hand-patching three call sites.
 */
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
