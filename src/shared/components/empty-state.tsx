import { cn } from '~/shared/lib/cn'

export interface EmptyStateProps {
  message: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  message,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 rounded-lg border border-dashed border-hairline px-6 py-16 text-center',
        className,
      )}
    >
      {icon ? <div className="text-mute">{icon}</div> : null}
      <p className="max-w-sm text-sm text-mute">{message}</p>
      {action}
    </div>
  )
}
