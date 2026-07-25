import { forwardRef } from 'react'

import { cn } from '~/shared/lib/cn'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  isInvalid?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, isInvalid = false, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-mute focus-visible:border-pine focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          isInvalid && 'border-status-declined',
          className,
        )}
        aria-invalid={isInvalid}
        {...props}
      />
    )
  },
)
