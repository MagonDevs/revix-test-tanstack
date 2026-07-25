import { Link } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { useState } from 'react'

import { Button } from '~/shared/ui/button'
import { SheetContent, SheetRoot, SheetTrigger } from '~/shared/ui/sheet'
import { UserMenu } from '~/shared/components/user-menu'

export interface AppHeaderUser {
  name: string
  avatarUrl?: string
}

export interface AppHeaderProps {
  /**
   * Presentational only — `shared` may not import `features/auth`, so the
   * route layer (`__root.tsx`) reads `useSession()` and passes the result
   * down as plain props.
   */
  user?: AppHeaderUser
  isSignedIn?: boolean
  pendingRequestCount?: number
  onSignOut?: () => void
}

export function AppHeader({
  user,
  isSignedIn = false,
  pendingRequestCount = 0,
  onSignOut = () => {},
}: AppHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-hairline bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-4 px-5">
        <Link to="/" className="font-display text-lg font-bold text-ink">
          Adopta
        </Link>

        <Link
          to="/pets"
          className="hidden text-sm font-medium text-ink outline-none hover:text-pine focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 sm:block"
        >
          Pets
        </Link>

        <div className="hidden items-center gap-3 sm:flex">
          {isSignedIn ? (
            <>
              <Button asChild variant="primary" size="sm">
                <Link to="/dashboard/pets/new">Publish a pet</Link>
              </Button>
              <UserMenu
                name={user?.name ?? ''}
                {...(user?.avatarUrl !== undefined
                  ? { avatarUrl: user.avatarUrl }
                  : {})}
                pendingRequestCount={pendingRequestCount}
                onSignOut={onSignOut}
              />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild variant="primary" size="sm">
                <Link
                  to="/register"
                  search={{ redirect: '/dashboard/pets/new' }}
                >
                  Publish a pet
                </Link>
              </Button>
            </>
          )}
        </div>

        <SheetRoot open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open menu"
              className="flex size-10 items-center justify-center rounded-md text-ink outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 sm:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" title="Menu">
            <nav className="flex flex-col gap-4">
              <Link
                to="/pets"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-medium text-ink"
              >
                Pets
              </Link>
              {isSignedIn ? (
                <>
                  <Link
                    to="/dashboard/pets/new"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-sm font-medium text-pine"
                  >
                    Publish a pet
                  </Link>
                  <Link
                    to="/dashboard/pets"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-sm text-mute"
                  >
                    My listings
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-sm text-mute"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    search={{ redirect: '/dashboard/pets/new' }}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-sm font-medium text-pine"
                  >
                    Publish a pet
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </SheetRoot>
      </div>
    </header>
  )
}
