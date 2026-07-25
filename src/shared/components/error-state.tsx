import { cn } from '~/shared/lib/cn'
import { Button } from '~/shared/ui/button'

export interface ErrorStateProps {
  message?: string
  onRetry: () => void
  className?: string
}

export function ErrorState({
  message = "We couldn't load this. Check your connection and try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 rounded-lg border border-hairline px-6 py-16 text-center',
        className,
      )}
    >
      <p className="max-w-sm text-sm text-mute">{message}</p>
      <Button variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}
