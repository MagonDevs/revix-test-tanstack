import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)')({
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-5 py-12">
      <div className="w-full max-w-[400px] rounded-lg border border-hairline bg-surface p-8">
        <Outlet />
      </div>
    </main>
  )
}
