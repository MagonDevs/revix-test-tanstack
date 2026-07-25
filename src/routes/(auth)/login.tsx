import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'

import { LoginFormShell } from '~/shared/components/login-form-shell'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/login')({
  validateSearch: loginSearchSchema,
  head: () => ({ meta: [{ title: 'Sign in · Adopta' }] }),
  component: LoginPage,
})

function LoginPage() {
  const { redirect } = Route.useSearch()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-xl font-semibold text-ink">Sign in</h1>
      <LoginFormShell />
      <p className="font-mono text-xs uppercase tracking-[0.08em] text-mute">
        marta@example.com · password123
      </p>
      <p className="text-sm text-mute">
        New here?{' '}
        <Link
          to="/register"
          search={{ redirect }}
          className="font-medium text-pine hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  )
}
