import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard/')({
  beforeLoad: () => {
    // TanStack Router's `redirect()` is thrown by design; it isn't a plain Error subclass.
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw redirect({ to: '/dashboard/pets' })
  },
})
