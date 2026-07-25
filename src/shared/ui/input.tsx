import { forwardRef } from 'react'

import { cn } from '~/shared/lib/cn'

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'prefix'
> {
  isInvalid?: boolean
  prefix?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, isInvalid = false, prefix, ...props },
  ref,
) {
  if (prefix) {
    return (
      <div
        className={cn(
          'flex h-10 items-center gap-2 rounded-md border border-hairline bg-surface px-3 text-sm text-ink focus-within:border-pine focus-within:ring-2 focus-within:ring-pine focus-within:ring-offset-2',
          isInvalid && 'border-status-declined',
          className,
        )}
      >
        <span className="text-mute">{prefix}</span>
        <input
          ref={ref}
          className="h-full w-full bg-transparent text-sm outline-none placeholder:text-mute disabled:cursor-not-allowed disabled:opacity-50"
          aria-invalid={isInvalid}
          {...props}
        />
      </div>
    )
  }

  return (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-md border border-hairline bg-surface px-3 text-sm text-ink outline-none placeholder:text-mute focus-visible:border-pine focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        isInvalid && 'border-status-declined',
        className,
      )}
      aria-invalid={isInvalid}
      {...props}
    />
  )
})
