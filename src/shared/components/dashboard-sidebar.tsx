import { Link } from '@tanstack/react-router'

import { cn } from '~/shared/lib/cn'

interface DashboardLink {
  label: string
  to: string
  badge?: number
}

const LINKS: DashboardLink[] = [
  { label: 'My listings', to: '/dashboard/pets' },
  { label: 'Requests received', to: '/dashboard/requests/received' },
  { label: 'Requests sent', to: '/dashboard/requests/sent' },
  { label: 'Favourites', to: '/dashboard/favourites' },
  { label: 'Profile', to: '/dashboard/profile' },
]

/**
 * A single markup source: a flex row that scrolls horizontally as a tab
 * strip below `lg`, and becomes a 240px vertical rail at `lg+` via
 * responsive classes — no duplicated markup for the two breakpoints.
 */
export function DashboardSidebar() {
  return (
    <nav
      aria-label="Dashboard"
      className="flex gap-1 overflow-x-auto border-b border-hairline pb-2 lg:w-60 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4"
    >
      {LINKS.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={cn(
            'flex shrink-0 items-center justify-between gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-mute outline-none transition-colors hover:bg-ink/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2',
          )}
          activeProps={{ className: 'bg-pine-tint text-pine' }}
        >
          {link.label}
          {link.badge ? (
            <span className="rounded-full bg-status-reserved px-1.5 py-0.5 font-mono text-[0.625rem] text-white">
              {link.badge}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  )
}
