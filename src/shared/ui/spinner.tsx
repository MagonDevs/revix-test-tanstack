import { Loader2 } from 'lucide-react'

import { cn } from '~/shared/lib/cn'

const SIZE_CLASSES = { sm: 'size-4', md: 'size-6' } as const

export interface SpinnerProps {
  size?: keyof typeof SIZE_CLASSES
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <Loader2
      role="status"
      aria-label="Loading"
      className={cn(
        'animate-spin text-mute motion-reduce:animate-none',
        SIZE_CLASSES[size],
        className,
      )}
    />
  )
}
