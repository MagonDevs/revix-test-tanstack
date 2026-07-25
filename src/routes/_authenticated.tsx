import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { sessionQuery, SiteHeader } from '~/features/auth'

import { AppFooter } from '~/shared/components/app-footer'
import { DashboardSidebar } from '~/shared/components/dashboard-sidebar'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.ensureQueryData(sessionQuery())
    if (!session) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router's redirect() is a special thrown object the router itself catches, not an Error.
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
    return { session }
  },
  component: DashboardShell,
})

function DashboardShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-5 py-8 lg:flex-row">
        <DashboardSidebar />
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </main>
      <AppFooter />
    </div>
  )
}
