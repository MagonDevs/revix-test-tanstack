import { z } from 'zod'

import {
  ageGroupSchema,
  petSortSchema,
  sexSchema,
  sizeSchema,
  speciesSchema,
} from '~/contracts'

export const petSearchSchema = z.object({
  q: z.string().trim().min(1).optional().catch(undefined),
  species: z.array(speciesSchema).optional().catch(undefined),
  size: z.array(sizeSchema).optional().catch(undefined),
  sex: sexSchema.optional().catch(undefined),
  ageGroup: ageGroupSchema.optional().catch(undefined),
  city: z.string().trim().min(1).optional().catch(undefined),
  sort: petSortSchema.default('newest').catch('newest'),
  page: z.coerce.number().int().positive().default(1).catch(1),
})
export type PetSearch = z.infer<typeof petSearchSchema>
