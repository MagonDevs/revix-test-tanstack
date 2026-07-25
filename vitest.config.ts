import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

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
