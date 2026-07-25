import { X } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'

import { cn } from '~/shared/lib/cn'

export const SheetRoot = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close

const SIDE_CLASSES = {
  bottom:
    'inset-x-0 bottom-0 max-h-[85vh] rounded-t-lg border-t data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom',
  right:
    'inset-y-0 right-0 h-full w-[85vw] max-w-sm border-l data-[state=open]:animate-in data-[state=open]:slide-in-from-right',
} as const

export interface SheetContentProps extends React.ComponentProps<
  typeof DialogPrimitive.Content
> {
  side?: keyof typeof SIDE_CLASSES
  title: string
}

export function SheetContent({
  className,
  side = 'bottom',
  title,
  children,
  ...props
}: SheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40" />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-50 flex flex-col gap-4 border-hairline bg-surface p-5 shadow-overlay outline-none',
          SIDE_CLASSES[side],
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <DialogPrimitive.Title className="font-display text-base font-semibold text-ink">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close
            aria-label="Close"
            className="rounded-md p-1 text-mute outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2"
          >
            <X className="size-4" aria-hidden="true" />
          </DialogPrimitive.Close>
        </div>
        <DialogPrimitive.Description className="sr-only">
          {title}
        </DialogPrimitive.Description>
        <div className="overflow-y-auto">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
