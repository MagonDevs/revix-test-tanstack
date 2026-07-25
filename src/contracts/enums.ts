import { z } from 'zod'

export const speciesSchema = z.enum(['dog', 'cat', 'rabbit', 'bird', 'other'])
export const sexSchema = z.enum(['male', 'female', 'unknown'])
export const sizeSchema = z.enum(['small', 'medium', 'large'])
export const ageGroupSchema = z.enum(['baby', 'young', 'adult', 'senior'])
export const petStatusSchema = z.enum([
  'available',
  'reserved',
  'adopted',
  'withdrawn',
])
export const requestStatusSchema = z.enum([
  'pending',
  'accepted',
  'declined',
  'withdrawn',
])
export const petSortSchema = z.enum(['newest', 'oldest', 'name_asc'])
export const requestRoleSchema = z.enum(['adopter', 'guardian'])

export type Species = z.infer<typeof speciesSchema>
export type Sex = z.infer<typeof sexSchema>
export type Size = z.infer<typeof sizeSchema>
export type AgeGroup = z.infer<typeof ageGroupSchema>
export type PetStatus = z.infer<typeof petStatusSchema>
export type RequestStatus = z.infer<typeof requestStatusSchema>
export type PetSort = z.infer<typeof petSortSchema>
export type RequestRole = z.infer<typeof requestRoleSchema>

export const AGE_GROUP_MONTHS: Record<AgeGroup, [number, number]> = {
  baby: [0, 5],
  young: [6, 23],
  adult: [24, 95],
  senior: [96, 360],
}
