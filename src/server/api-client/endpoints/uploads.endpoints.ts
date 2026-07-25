import { apiRequest } from '../http'

import { uploadDtoSchema } from '~/contracts'

/** Body must be a FormData with a single `file` field — see http.ts's FormData passthrough. */
export function uploadFile(body: FormData, headers?: HeadersInit) {
  return apiRequest({
    path: '/uploads',
    method: 'POST',
    body,
    schema: uploadDtoSchema,
    headers,
  })
}
