import { StatusStamp } from '~/shared/ui/status-stamp'

import type { RequestStatus } from '~/contracts'

export function RequestStatusStamp({
  status,
  className,
}: {
  status: RequestStatus
  className?: string
}) {
  return <StatusStamp status={status} {...(className ? { className } : {})} />
}
