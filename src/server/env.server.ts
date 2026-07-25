import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  API_BASE_URL: z.url(),
  API_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  MOCK_API: z.stringbool().default(true),
  MOCK_LATENCY_MS: z.coerce.number().int().nonnegative().default(180),
  MOCK_ERROR_RATE: z.coerce.number().min(0).max(1).default(0),
  MOCK_PERSIST: z.stringbool().default(false),
})

export const serverEnv = schema.parse(process.env)
