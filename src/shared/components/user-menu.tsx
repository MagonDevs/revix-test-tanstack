import { Link } from '@tanstack/react-router'

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/shared/ui/dropdown-menu'
import { Avatar } from '~/shared/ui/avatar'

export interface UserMenuProps {
  name: string
  avatarUrl?: string
  pendingRequestCount?: number
  onSignOut: () => void
}

export function UserMenu({
  name,
  avatarUrl,
  pendingRequestCount = 0,
  onSignOut,
}: UserMenuProps) {
  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2"
      >
        <Avatar
          name={name}
          {...(avatarUrl !== undefined ? { src: avatarUrl } : {})}
          size="sm"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/dashboard/pets">My listings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard/requests/received">
            Requests
            {pendingRequestCount > 0 ? ` (${pendingRequestCount})` : ''}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard/favourites">Favourites</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSignOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  )
}
