import { z } from 'zod'

import type { CreatePetRequest, UpdatePetRequest } from '~/contracts'

import { sexSchema, sizeSchema, speciesSchema } from '~/contracts'

export const petPhotoFormSchema = z.object({
  localId: z.string(),
  uploadId: z.string().nullable(),
  previewUrl: z.string(),
  status: z.enum(['pending', 'uploading', 'uploaded', 'error']),
  errorMessage: z.string().optional(),
})
export type PetPhotoFormValue = z.infer<typeof petPhotoFormSchema>

export const petFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(40, 'Name must be 40 characters or fewer.'),
  species: speciesSchema,
  breed: z
    .string()
    .trim()
    .max(60, 'Breed must be 60 characters or fewer.')
    .nullable(),
  sex: sexSchema,
  ageMonths: z
    .number({ error: 'Enter an age in months.' })
    .int('Age must be a whole number of months.')
    .min(0, 'Age cannot be negative.')
    .max(360, 'Age must be 360 months or fewer.'),
  size: sizeSchema,
  weightKg: z
    .number()
    .min(0.1, 'Weight must be at least 0.1kg.')
    .max(120, 'Weight must be 120kg or fewer.')
    .multipleOf(0.1, 'Weight allows one decimal place.')
    .nullable(),
  description: z
    .string()
    .trim()
    .min(30, 'Description must be at least 30 characters.')
    .max(2000, 'Description must be 2000 characters or fewer.'),
  city: z
    .string()
    .trim()
    .min(2, 'City must be at least 2 characters.')
    .max(80, 'City must be 80 characters or fewer.'),
  photos: z
    .array(petPhotoFormSchema)
    .min(1, 'Add at least one photo.')
    .max(6, 'Up to 6 photos.'),
  isVaccinated: z.boolean(),
  isNeutered: z.boolean(),
  isGoodWithKids: z.boolean(),
  isGoodWithPets: z.boolean(),
})
export type PetFormValues = z.infer<typeof petFormSchema>

export function createEmptyPetFormValues(): PetFormValues {
  return {
    name: '',
    species: 'dog',
    breed: null,
    sex: 'unknown',
    ageMonths: 0,
    size: 'medium',
    weightKg: null,
    description: '',
    city: '',
    photos: [],
    isVaccinated: false,
    isNeutered: false,
    isGoodWithKids: false,
    isGoodWithPets: false,
  }
}

export function toCreatePetRequest(values: PetFormValues): CreatePetRequest {
  return {
    name: values.name,
    species: values.species,
    breed: values.breed || null,
    sex: values.sex,
    ageMonths: values.ageMonths,
    size: values.size,
    weightKg: values.weightKg,
    description: values.description,
    city: values.city,
    photos: values.photos
      .filter((photo) => photo.uploadId !== null)
      .map((photo) => ({ uploadId: photo.uploadId as string })),
    isVaccinated: values.isVaccinated,
    isNeutered: values.isNeutered,
    isGoodWithKids: values.isGoodWithKids,
    isGoodWithPets: values.isGoodWithPets,
  }
}

export function toUpdatePetRequest(
  values: PetFormValues,
  initialValues: PetFormValues,
): UpdatePetRequest {
  const full = toCreatePetRequest(values)
  const initialFull = toCreatePetRequest(initialValues)
  const diff: UpdatePetRequest = {}

  for (const key of Object.keys(full) as Array<keyof CreatePetRequest>) {
    if (key === 'photos') {
      const photosChanged =
        JSON.stringify(full.photos) !== JSON.stringify(initialFull.photos)
      if (photosChanged) diff.photos = full.photos
      continue
    }
    if (full[key] !== initialFull[key]) {
      // @ts-expect-error -- per-key assignment across a discriminated diff is safe here
      diff[key] = full[key]
    }
  }

  return diff
}
