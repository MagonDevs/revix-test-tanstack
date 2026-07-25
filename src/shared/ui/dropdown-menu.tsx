import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui'

import { cn } from '~/shared/lib/cn'

export const DropdownMenuRoot = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-[180px] rounded-lg border border-hairline bg-surface p-1 shadow-overlay',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

export interface DropdownMenuItemProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Item
> {
  isDestructive?: boolean
}

export function DropdownMenuItem({
  className,
  isDestructive = false,
  ...props
}: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        'flex h-9 cursor-pointer select-none items-center rounded-sm px-2 text-sm text-ink outline-none data-[highlighted]:bg-pine-tint',
        isDestructive &&
          'text-status-declined data-[highlighted]:bg-status-declined/10',
        className,
      )}
      {...props}
    />
  )
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn('my-1 h-px bg-hairline', className)}
      {...props}
    />
  )
}
