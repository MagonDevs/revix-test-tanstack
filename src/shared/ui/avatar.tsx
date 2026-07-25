import { Avatar as AvatarPrimitive } from 'radix-ui'

import { cn } from '~/shared/lib/cn'

const SIZE_CLASSES = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-16 text-lg',
} as const

export interface AvatarProps {
  src?: string
  name: string
  size?: keyof typeof SIZE_CLASSES
  className?: string
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-hairline bg-pine-tint font-medium text-pine',
        SIZE_CLASSES[size],
        className,
      )}
    >
      <AvatarPrimitive.Image
        src={src}
        alt={name}
        className="size-full object-cover"
      />
      <AvatarPrimitive.Fallback delayMs={src ? 300 : 0}>
        {getInitials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}
