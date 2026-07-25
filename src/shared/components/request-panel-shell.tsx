import { Button } from '~/shared/ui/button'
import { MonoLabel } from '~/shared/ui/mono-label'
import { StatusStamp } from '~/shared/ui/status-stamp'
import type { RequestStatus } from '~/shared/ui/status-stamp'
import { Avatar } from '~/shared/ui/avatar'

export interface RequestPanelShellProps {
  personName: string
  city: string
  petName: string
  status: RequestStatus
  message: string
  direction: 'received' | 'sent'
}

export function RequestPanelShell({
  personName,
  city,
  petName,
  status,
  message,
  direction,
}: RequestPanelShellProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-hairline p-4">
      <div className="flex items-center gap-3">
        <Avatar name={personName} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">
            {personName} · {city}
          </p>
          <p className="text-sm text-mute">
            {direction === 'received' ? 'wants to adopt' : 'you asked about'}{' '}
            <span className="font-medium text-ink">{petName}</span>
          </p>
        </div>
        <StatusStamp status={status} />
      </div>
      <p className="line-clamp-4 rounded-md border border-hairline bg-paper px-3 py-2 text-sm text-ink">
        {message}
      </p>
      {status === 'accepted' ? (
        <div className="rounded-md border border-hairline px-3 py-2">
          <MonoLabel>Contact</MonoLabel>
          <p className="mt-1 text-sm text-ink">
            name@example.com · +34 000 000 000
          </p>
        </div>
      ) : (
        <div className="flex gap-2">
          {direction === 'received' ? (
            <>
              <Button size="sm">Accept</Button>
              <Button size="sm" variant="ghost">
                Decline
              </Button>
            </>
          ) : (
            <Button size="sm" variant="ghost">
              Withdraw request
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
