import { X } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'

import { cn } from '~/shared/lib/cn'

export const DialogRoot = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

const SIZE_CLASSES = { sm: 'max-w-sm', md: 'max-w-lg' } as const

export interface DialogContentProps extends React.ComponentProps<
  typeof DialogPrimitive.Content
> {
  size?: keyof typeof SIZE_CLASSES
  title: string
  description?: string
}

export function DialogContent({
  className,
  size = 'md',
  title,
  description,
  children,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2.5rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-hairline bg-surface p-6 shadow-overlay outline-none',
          SIZE_CLASSES[size],
          className,
        )}
        {...props}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <DialogPrimitive.Title className="font-display text-lg font-semibold text-ink">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="mt-1 text-sm text-mute">
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>
          <DialogPrimitive.Close
            aria-label="Close"
            className="rounded-md p-1 text-mute outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2"
          >
            <X className="size-4" aria-hidden="true" />
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
