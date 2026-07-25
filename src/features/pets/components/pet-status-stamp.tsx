import { StatusStamp } from '~/shared/ui/status-stamp'

import type { PetStatus } from '~/contracts'

export function PetStatusStamp({
  status,
  className,
}: {
  status: PetStatus
  className?: string
}) {
  return <StatusStamp status={status} {...(className ? { className } : {})} />
}
