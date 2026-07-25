import { apiRequest } from '../http'

import { uploadDtoSchema } from '~/contracts'

export function uploadFile(body: FormData, headers?: HeadersInit) {
  return apiRequest({
    path: '/uploads',
    method: 'POST',
    body,
    schema: uploadDtoSchema,
    headers,
  })
}
