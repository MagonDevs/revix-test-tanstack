import { useNavigate } from '@tanstack/react-router'
import { Heart } from 'lucide-react'

import { useSession } from '~/features/auth'

import { cn } from '~/shared/lib/cn'

import { useToggleFavourite } from '../api/favourites.mutations'

export interface FavouriteButtonProps {
  petId: string
  isFavourited: boolean
  redirectPath: string
  className?: string
}

export function FavouriteButton({
  petId,
  isFavourited,
  redirectPath,
  className,
}: FavouriteButtonProps) {
  const { isAuthenticated } = useSession()
  const toggleFavourite = useToggleFavourite()
  const navigate = useNavigate()

  const baseClassName = cn(
    'inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface/90 text-ink outline-none transition-colors duration-150 ease-out hover:border-ink/40 focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2',
    className,
  )

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        aria-label="Sign in to save this pet"
        className={baseClassName}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void navigate({ to: '/login', search: { redirect: redirectPath } })
        }}
      >
        <Heart className="size-5" aria-hidden="true" />
      </button>
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
