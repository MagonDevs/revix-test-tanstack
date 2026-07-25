import { cn } from '~/shared/lib/cn'

export interface PageHeaderProps {
  title: string
  count?: number
  action?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  count,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-4',
        className,
      )}
    >
      <div className="flex items-baseline gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">
          {title}
        </h1>
        {count !== undefined ? (
          <span className="font-mono text-xs uppercase tracking-[0.08em] text-mute">
            {count}
          </span>
        ) : null}
      </div>
      {action}
    </div>
  )
}
