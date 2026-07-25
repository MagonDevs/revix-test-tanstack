import { X } from 'lucide-react'

import { cn } from '~/shared/lib/cn'

export interface ChipProps {
  children: React.ReactNode
  variant?: 'filter' | 'static'
  onRemove?: () => void
  className?: string
}

export function Chip({
  children,
  variant = 'static',
  onRemove,
  className,
}: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border border-hairline bg-surface px-2.5 py-1 font-mono text-xs uppercase tracking-[0.08em] text-ink',
        className,
      )}
    >
      {children}
      {variant === 'filter' && onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove filter"
          className="rounded-full text-mute outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-1"
        >
          <X className="size-3" aria-hidden="true" />
        </button>
      ) : null}
    </span>
  )
}
