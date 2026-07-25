import { z } from 'zod'

import type { UpdateUserRequest, SessionUserDto } from '~/contracts'

/**
 * Form schema for `PATCH /users/me` per doc03 §3.2/§1.5 — email is
 * intentionally excluded (read-only in the MVP, the API rejects it with
 * `422`). Constraints mirror `updateUserRequestSchema`.
 */
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
  // Display only — the avatar preview. Never sent to the API; see `avatarUploadId`.
  avatarUrl: z.string().nullable(),
  // Set after a successful photo upload; the id (not the URL) is what the API accepts.
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

/** Diffs against the initial values so the PATCH only carries changed fields. */
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
  // avatarUploadId isn't diffed against an initial value — it's only ever set
  // once a new photo has been uploaded, so its presence alone means "send it".
  if (values.avatarUploadId !== undefined) {
    diff.avatarUploadId = values.avatarUploadId
  }
  return diff
}
