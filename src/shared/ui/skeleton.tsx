import { cn } from '~/shared/lib/cn'

const VARIANT_CLASSES = {
  text: 'h-4 w-full rounded-sm',
  block: 'h-24 w-full rounded-lg',
  avatar: 'size-10 rounded-full',
  card: 'h-64 w-full rounded-lg',
} as const

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof VARIANT_CLASSES
}

export function Skeleton({
  variant = 'text',
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'animate-pulse bg-hairline motion-reduce:animate-none',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  )
}
