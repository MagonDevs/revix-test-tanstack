import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { Slot as SlotPrimitive } from 'radix-ui'
import { forwardRef } from 'react'

import { cn } from '~/shared/lib/cn'

export const buttonVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-sans font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-ink text-white hover:opacity-90',
        secondary:
          'border border-hairline bg-surface text-ink hover:border-ink/40',
        ghost: 'text-ink hover:bg-ink/5',
        destructive: 'bg-status-declined text-white hover:opacity-90',
        link: 'text-pine underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
      iconOnly: {
        true: 'aspect-square px-0',
        false: '',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md', iconOnly: false },
  },
)

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  /** Merge props onto the single child element instead of rendering a <button>. */
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant,
      size,
      iconOnly,
      isLoading = false,
      disabled,
      asChild = false,
      children,
      ...props
    },
    ref,
  ) {
    if (asChild) {
      return (
        <SlotPrimitive.Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size, iconOnly }), className)}
          {...props}
        >
          {children}
        </SlotPrimitive.Slot>
      )
    }

    return (
      <button
        ref={ref}
        type={props.type ?? 'button'}
        className={cn(buttonVariants({ variant, size, iconOnly }), className)}
        disabled={disabled ?? isLoading}
        aria-busy={isLoading}
        {...props}
      >
        <span
          className={cn(
            'inline-flex items-center gap-2',
            isLoading && 'invisible',
          )}
        >
          {children}
        </span>
        {isLoading ? (
          <Loader2
            className="absolute size-4 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        ) : null}
      </button>
    )
  },
)
