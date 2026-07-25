import { z } from 'zod'

import type { UpdateUserRequest, SessionUserDto } from '~/contracts'

export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(60, 'Name must be 60 characters or fewer.'),
  city: z
    .string()
    .trim()
    .min(2, 'City must be at least 2 characters.')
    .max(80, 'City must be 80 characters or fewer.'),
  phone: z
    .string()
    .trim()
    .max(30, 'Phone must be 30 characters or fewer.')
    .nullable(),
  bio: z
    .string()
    .trim()
    .max(500, 'Bio must be 500 characters or fewer.')
    .nullable(),
  avatarUrl: z.string().nullable(),
  avatarUploadId: z.string().nullable().optional(),
})
export type ProfileFormValues = z.infer<typeof profileFormSchema>

export function toProfileFormValues(user: SessionUserDto): ProfileFormValues {
  return {
    name: user.name,
    city: user.city,
    phone: user.phone,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    avatarUploadId: undefined,
  }
}

export function toUpdateUserRequest(
  values: ProfileFormValues,
  initialValues: ProfileFormValues,
): UpdateUserRequest {
  const diff: UpdateUserRequest = {}
  const diffableKeys = ['name', 'city', 'phone', 'bio'] as const
  for (const key of diffableKeys) {
    if (values[key] !== initialValues[key]) {
      // @ts-expect-error -- each field's value type matches its own key.
      diff[key] = values[key]
    }
  }
  if (values.avatarUploadId !== undefined) {
    diff.avatarUploadId = values.avatarUploadId
  }
  return diff
}
