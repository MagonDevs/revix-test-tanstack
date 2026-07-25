import { createFileRoute, Outlet } from '@tanstack/react-router'

import { AppFooter } from '~/shared/components/app-footer'
import { AppHeader } from '~/shared/components/app-header'
import { DashboardSidebar } from '~/shared/components/dashboard-sidebar'

// TODO(phase-3): beforeLoad auth guard — redirect to /login with a `redirect` search param
export const Route = createFileRoute('/_authenticated')({
  component: DashboardShell,
})

function DashboardShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader isSignedIn />
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
