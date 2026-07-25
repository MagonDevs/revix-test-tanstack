import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'

import { updateMe } from '~/server/api-client/endpoints/users.endpoints'
import { withApiErrors } from '~/server/api-client/serialize-error'

import { updateUserRequestSchema } from '~/contracts'

function forwardedHeaders(): HeadersInit {
  const cookie = getRequestHeader('cookie')
  return cookie ? { cookie } : {}
}

export const updateProfileFn = createServerFn({ method: 'POST' })
  .inputValidator(updateUserRequestSchema)
  .handler(
    withApiErrors(async ({ data }) => {
      return await updateMe(data, forwardedHeaders())
    }),
  )
