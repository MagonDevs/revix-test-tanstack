import { ApiError } from '~/server/api-client/api-error'

import { requireAuth } from '../auth-guard'
import { toUploadDto } from '../mappers'
import { db, insert, newId, nowIso, uploadBytes } from '../repository'
import { jsonResponse } from '../response'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024
const FAKE_WIDTH = 1200
const FAKE_HEIGHT = 800

export async function createUpload(ctx: {
  request: Request
}): Promise<Response> {
  const viewer = requireAuth(ctx.request)

  let form: FormData
  try {
    form = await ctx.request.formData()
  } catch {
    throw ApiError.create(
      422,
      'validation_error',
      'Expected multipart/form-data with a `file` field.',
    )
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    throw ApiError.create(422, 'validation_error', 'A file is required.', [
      { field: 'file', message: 'Attach an image file.' },
    ])
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw ApiError.create(422, 'validation_error', 'Unsupported file type.', [
      { field: 'file', message: 'Only JPEG, PNG or WebP files are allowed.' },
    ])
  }
  if (file.size > MAX_BYTES) {
    throw ApiError.create(
      413,
      'validation_error',
      'File is larger than 5 MB.',
      [{ field: 'file', message: 'File is larger than 5 MB.' }],
    )
  }

  const id = newId()
  const bytes = await file.arrayBuffer()
  uploadBytes.set(id, { bytes, contentType: file.type })

  const createdAt = nowIso()
  const upload = insert(db.uploads, id, {
    id,
    url: `/api/v1/uploads/${id}/raw`,
    width: FAKE_WIDTH,
    height: FAKE_HEIGHT,
    byteSize: file.size,
    ownerId: viewer.id,
    consumed: false,
    createdAt,
    updatedAt: createdAt,
  })

  return jsonResponse(toUploadDto(upload), 201, { location: upload.url })
}

export function getUploadRaw(ctx: { params: { uploadId: string } }): Response {
  const entry = uploadBytes.get(ctx.params.uploadId)
  if (!entry) throw ApiError.create(404, 'not_found', 'Upload not found.')
  return new Response(entry.bytes, {
    headers: { 'content-type': entry.contentType },
  })
}
