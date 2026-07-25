import { uploadDtoSchema } from '~/contracts'

import { apiRequest } from '../http'

export function uploadFile(body: FormData, headers?: HeadersInit) {
  return apiRequest({
    path: '/uploads',
    method: 'POST',
    body,
    schema: uploadDtoSchema,
    headers,
  })
}
