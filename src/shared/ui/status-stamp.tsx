import { cn } from '~/shared/lib/cn'

export type PetStatus = 'available' | 'reserved' | 'adopted' | 'withdrawn'
export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn'
export type StampStatus = PetStatus | RequestStatus

const DOT_CLASSES: Record<StampStatus, string> = {
  available: 'bg-status-available',
  reserved: 'bg-status-reserved',
  pending: 'bg-status-reserved',
  adopted: 'bg-status-adopted',
  accepted: 'bg-status-adopted',
  withdrawn: 'bg-status-withdrawn',
  declined: 'bg-status-declined',
}

export interface StatusStampProps {
  status: StampStatus
  className?: string
}

export function StatusStamp({ status, className }: StatusStampProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border border-hairline bg-surface px-2 py-0.5 font-mono text-xs uppercase tracking-[0.08em] text-ink',
        className,
      )}
    >
      <span
        className={cn('size-1.5 shrink-0 rounded-full', DOT_CLASSES[status])}
        aria-hidden="true"
      />
      {status}
    </span>
  )
}
