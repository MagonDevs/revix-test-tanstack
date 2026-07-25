import { z } from 'zod'

const schema = z.object({
  VITE_APP_NAME: z.string().default('Adopta'),
})

export const clientEnv = schema.parse(import.meta.env)
