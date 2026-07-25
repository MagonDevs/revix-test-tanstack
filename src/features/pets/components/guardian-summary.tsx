import { Link } from '@tanstack/react-router'

import { Avatar } from '~/shared/ui/avatar'

import type { UserSummaryDto } from '~/contracts'

export function GuardianSummary({
  guardian,
  otherPetCount,
}: {
  guardian: UserSummaryDto
  otherPetCount?: number
}) {
  return (
    <Link
      to="/users/$userId"
      params={{ userId: guardian.id }}
      className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2"
    >
      <Avatar
        {...(guardian.avatarUrl ? { src: guardian.avatarUrl } : {})}
        name={guardian.name}
        size="md"
      />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-ink">{guardian.name}</span>
        <span className="font-mono text-xs uppercase tracking-[0.08em] text-mute">
          {guardian.city}
          {otherPetCount !== undefined
            ? ` · ${otherPetCount} other pet${otherPetCount === 1 ? '' : 's'}`
            : ''}
        </span>
      </div>
    </Link>
  )
}
