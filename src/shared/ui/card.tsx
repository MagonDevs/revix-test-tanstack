import { cn } from '~/shared/lib/cn'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  isInteractive?: boolean
}

export function Card({
  className,
  isInteractive = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'group rounded-lg border border-hairline bg-surface',
        isInteractive &&
          'transition-colors duration-150 ease-out hover:border-ink/20 focus-within:ring-2 focus-within:ring-pine focus-within:ring-offset-2',
        className,
      )}
      {...props}
    />
  )
}
