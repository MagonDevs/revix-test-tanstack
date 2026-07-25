import { MoreHorizontal } from 'lucide-react'

import { MonoLabel } from '~/shared/ui/mono-label'
import { StatusStamp } from '~/shared/ui/status-stamp'
import type { PetStatus } from '~/shared/ui/status-stamp'

export interface PetListingRowShellProps {
  name: string
  status: PetStatus
  pendingRequestCount?: number
}

export function PetListingRowShell({
  name,
  status,
  pendingRequestCount = 0,
}: PetListingRowShellProps) {
  return (
    <div className="flex items-center gap-4 border-b border-hairline py-3 last:border-b-0">
      <div className="flex size-16 shrink-0 items-center justify-center rounded-md border border-hairline bg-surface">
        <MonoLabel>No photo</MonoLabel>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{name}</p>
        <MonoLabel>Dog · 1Y6M · Medium</MonoLabel>
      </div>
      <StatusStamp status={status} />
      <span className="hidden text-sm text-mute sm:block">
        {pendingRequestCount} pending requests
      </span>
      <button
        type="button"
        aria-label="Row actions"
        className="flex size-9 shrink-0 items-center justify-center rounded-md text-mute outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2"
      >
        <MoreHorizontal className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
