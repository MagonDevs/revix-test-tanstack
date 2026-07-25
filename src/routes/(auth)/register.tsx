import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'

import { RegisterForm } from '~/features/auth'

const registerSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/register')({
  validateSearch: registerSearchSchema,
  head: () => ({ meta: [{ title: 'Create an account · Adopta' }] }),
  component: RegisterPage,
})

function RegisterPage() {
  const { redirect } = Route.useSearch()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-xl font-semibold text-ink">
        Create an account
      </h1>
      <RegisterForm />
      <p className="text-sm text-mute">
        Already have an account?{' '}
        <Link
          to="/login"
          search={{ redirect }}
          className="font-medium text-pine hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
