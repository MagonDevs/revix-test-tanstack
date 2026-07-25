import { z } from 'zod'

import { idSchema } from './common.contract'

export const uploadDtoSchema = z.object({
  id: idSchema,
  url: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  byteSize: z.number().int().positive(),
})
export type UploadDto = z.infer<typeof uploadDtoSchema>
