import { describe, expect, it } from 'vitest'

import {
  createEmptyPetFormValues,
  petFormSchema,
  toCreatePetRequest,
  toUpdatePetRequest,
  type PetFormValues,
} from './pet-form.schema'

function withPhoto(values: PetFormValues): PetFormValues {
  return {
    ...values,
    photos: [
      {
        localId: 'p1',
        uploadId: 'upload-1',
        previewUrl: 'https://cdn.example.com/p1.jpg',
        status: 'uploaded',
      },
    ],
  }
}

function validValues(): PetFormValues {
  return withPhoto({
    ...createEmptyPetFormValues(),
    name: 'Nala',
    description: 'A very good dog who loves long walks and belly rubs daily.',
    city: 'Madrid',
    ageMonths: 18,
    weightKg: 12.5,
  })
}

describe('petFormSchema — boundary validation', () => {
  it('accepts a fully valid form', () => {
    const result = petFormSchema.safeParse(validValues())
    expect(result.success).toBe(true)
  })

  it('rejects a name shorter than 2 characters', () => {
    const result = petFormSchema.safeParse({ ...validValues(), name: 'N' })
    expect(result.success).toBe(false)
  })

  it('accepts a name at the 40 character max', () => {
    const result = petFormSchema.safeParse({
      ...validValues(),
      name: 'N'.repeat(40),
    })
    expect(result.success).toBe(true)
  })

  it('rejects a name over 40 characters', () => {
    const result = petFormSchema.safeParse({
      ...validValues(),
      name: 'N'.repeat(41),
    })
    expect(result.success).toBe(false)
  })

  it('rejects a description shorter than 30 characters', () => {
    const result = petFormSchema.safeParse({
      ...validValues(),
      description: 'Too short.',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a description over 2000 characters', () => {
    const result = petFormSchema.safeParse({
      ...validValues(),
      description: 'a'.repeat(2001),
    })
    expect(result.success).toBe(false)
  })

  it('rejects ageMonths below 0', () => {
    const result = petFormSchema.safeParse({ ...validValues(), ageMonths: -1 })
    expect(result.success).toBe(false)
  })

  it('accepts ageMonths at the 360 max', () => {
    const result = petFormSchema.safeParse({
      ...validValues(),
      ageMonths: 360,
    })
    expect(result.success).toBe(true)
  })

  it('rejects ageMonths over 360', () => {
    const result = petFormSchema.safeParse({
      ...validValues(),
      ageMonths: 361,
    })
    expect(result.success).toBe(false)
  })

  it('allows a null weightKg', () => {
    const result = petFormSchema.safeParse({
      ...validValues(),
      weightKg: null,
    })
    expect(result.success).toBe(true)
  })

  it('rejects weightKg below 0.1', () => {
    const result = petFormSchema.safeParse({
      ...validValues(),
      weightKg: 0.05,
    })
    expect(result.success).toBe(false)
  })

  it('rejects weightKg above 120', () => {
    const result = petFormSchema.safeParse({
      ...validValues(),
      weightKg: 120.1,
    })
    expect(result.success).toBe(false)
  })

  it('rejects weightKg with more than one decimal place', () => {
    const result = petFormSchema.safeParse({
      ...validValues(),
      weightKg: 12.55,
    })
    expect(result.success).toBe(false)
  })

  it('rejects a city shorter than 2 characters', () => {
    const result = petFormSchema.safeParse({ ...validValues(), city: 'M' })
    expect(result.success).toBe(false)
  })

  it('rejects a breed over 60 characters', () => {
    const result = petFormSchema.safeParse({
      ...validValues(),
      breed: 'b'.repeat(61),
    })
    expect(result.success).toBe(false)
  })

  it('allows a null breed', () => {
    const result = petFormSchema.safeParse({ ...validValues(), breed: null })
    expect(result.success).toBe(true)
  })

  it('rejects zero photos', () => {
    const result = petFormSchema.safeParse({
      ...createEmptyPetFormValues(),
      name: 'Nala',
      description: 'A very good dog who loves long walks and belly rubs daily.',
      city: 'Madrid',
      ageMonths: 18,
    })
    expect(result.success).toBe(false)
  })

  it('rejects more than 6 photos', () => {
    const values = validValues()
    const result = petFormSchema.safeParse({
      ...values,
      photos: Array.from({ length: 7 }, (_, index) => ({
        localId: `p${index}`,
        uploadId: `upload-${index}`,
        previewUrl: 'https://cdn.example.com/p.jpg',
        status: 'uploaded' as const,
      })),
    })
    expect(result.success).toBe(false)
  })
})

describe('toCreatePetRequest', () => {
  it('maps only uploaded photos to uploadId refs', () => {
    const values = validValues()
    values.photos.push({
      localId: 'p2',
      uploadId: null,
      previewUrl: 'blob:local',
      status: 'uploading',
    })
    const request = toCreatePetRequest(values)
    expect(request.photos).toEqual([{ uploadId: 'upload-1' }])
  })

  it('maps an empty breed string to null', () => {
    const values = { ...validValues(), breed: '' }
    const request = toCreatePetRequest(values)
    expect(request.breed).toBeNull()
  })
})

describe('toUpdatePetRequest', () => {
  it('produces an empty diff when nothing changed', () => {
    const values = validValues()
    const diff = toUpdatePetRequest(values, values)
    expect(diff).toEqual({})
  })

  it('includes only the fields that changed', () => {
    const initial = validValues()
    const edited = { ...initial, name: 'Luna' }
    const diff = toUpdatePetRequest(edited, initial)
    expect(diff).toEqual({ name: 'Luna' })
  })

  it('includes the whole photos array when photo order changes', () => {
    const initial = validValues()
    initial.photos.push({
      localId: 'p2',
      uploadId: 'upload-2',
      previewUrl: 'https://cdn.example.com/p2.jpg',
      status: 'uploaded',
    })
    const reordered = { ...initial, photos: [...initial.photos].reverse() }
    const diff = toUpdatePetRequest(reordered, initial)
    expect(diff.photos).toEqual([
      { uploadId: 'upload-2' },
      { uploadId: 'upload-1' },
    ])
  })
})
