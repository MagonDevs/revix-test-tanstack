import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite only exposes `.env` values via `import.meta.env`, not `process.env` — but
// `src/server/env.server.ts` (and anything importing it, e.g. the mock backend and
// http.ts) reads `process.env` directly, same as it will at runtime. Mirror that here so
// unit tests see the same env the dev/build server does, without duplicating defaults.
const env = loadEnv('test', process.cwd(), '')
for (const [key, value] of Object.entries(env)) process.env[key] ??= value

export default defineConfig({
  plugins: [tailwindcss(), viteReact()],
  resolve: { alias: { '~': new URL('./src', import.meta.url).pathname } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['node_modules', 'tests/e2e', '.tanstack'],
  },
})
