import { Link } from '@tanstack/react-router'
import { Heart } from 'lucide-react'

import { useSession } from '~/features/auth'

import { cn } from '~/shared/lib/cn'

import { useToggleFavourite } from '../api/favourites.mutations'

export interface FavouriteButtonProps {
  petId: string
  isFavourited: boolean
  /** Path to send a signed-out visitor back to after they sign in. */
  redirectPath: string
  className?: string
}

/**
 * Heart toggle per doc04 Part D. Signed out, it's a link into `/login` with
 * a `redirect` param (US-501) rather than a button — no optimistic mutation
 * fires for a visitor who isn't authenticated. Signed in, it delegates to
 * `useToggleFavourite`. ≥44px touch target per doc02's a11y budget.
 */
export function FavouriteButton({
  petId,
  isFavourited,
  redirectPath,
  className,
}: FavouriteButtonProps) {
  const { isAuthenticated } = useSession()
  const toggleFavourite = useToggleFavourite()

  const baseClassName = cn(
    'inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface/90 text-ink outline-none transition-colors duration-150 ease-out hover:border-ink/40 focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2',
    className,
  )

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        search={{ redirect: redirectPath }}
        onClick={(event) => event.stopPropagation()}
        aria-label="Sign in to save this pet"
        className={baseClassName}
      >
        <Heart className="size-5" aria-hidden="true" />
      </Link>
    )
  }

  return (
    <button
      type="button"
      aria-pressed={isFavourited}
      aria-label={
        isFavourited ? 'Remove from favourites' : 'Save to favourites'
      }
      className={baseClassName}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggleFavourite.mutate({ petId, isFavourited })
      }}
    >
      <Heart
        className={cn(
          'size-5',
          isFavourited && 'fill-status-declined text-status-declined',
        )}
        aria-hidden="true"
      />
    </button>
  )
}
