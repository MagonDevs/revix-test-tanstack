import { speciesSchema } from '~/contracts'

import { jsonResponse } from '../response'

const BREEDS_BY_SPECIES: Record<string, string[]> = {
  dog: ['Podenco mix', 'Labrador', 'Galgo', 'Mestizo', 'Pastor alemán'],
  cat: ['Común europeo', 'Siamés', 'Persa', 'Mestizo'],
  rabbit: ['Enano', 'Cabeza de león', 'Ariete'],
  bird: ['Periquito', 'Canario', 'Cacatúa'],
  other: [],
}

export function getBreeds(ctx: { request: Request }): Response {
  const url = new URL(ctx.request.url)
  const parsed = speciesSchema.safeParse(url.searchParams.get('species'))
  const items = parsed.success ? (BREEDS_BY_SPECIES[parsed.data] ?? []) : []
  return jsonResponse({ items })
}
