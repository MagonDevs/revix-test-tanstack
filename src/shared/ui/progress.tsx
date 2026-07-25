import { Progress as ProgressPrimitive } from 'radix-ui'

import { cn } from '~/shared/lib/cn'

export interface ProgressProps {
  value: number
  className?: string
  'aria-label'?: string
}

export function Progress({
  value,
  className,
  'aria-label': ariaLabel,
}: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      value={value}
      aria-label={ariaLabel}
      className={cn(
        'h-1.5 w-full overflow-hidden rounded-full bg-hairline',
        className,
      )}
    >
      <ProgressPrimitive.Indicator
        className="h-full bg-pine transition-transform duration-150 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}
