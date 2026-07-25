import { Check } from 'lucide-react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'

import { cn } from '~/shared/lib/cn'

export interface CheckboxProps {
  checked?: boolean | 'indeterminate'
  onCheckedChange?: (checked: boolean | 'indeterminate') => void
  isDisabled?: boolean
  id?: string
  className?: string
  'aria-label'?: string
}

export function Checkbox({
  checked,
  onCheckedChange,
  isDisabled = false,
  id,
  className,
  'aria-label': ariaLabel,
}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      {...(id !== undefined ? { id } : {})}
      {...(checked !== undefined ? { checked } : {})}
      {...(onCheckedChange !== undefined ? { onCheckedChange } : {})}
      disabled={isDisabled}
      {...(ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {})}
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-sm border border-hairline bg-surface outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-pine data-[state=checked]:bg-pine data-[state=indeterminate]:border-pine data-[state=indeterminate]:bg-pine',
        className,
      )}
    >
      <CheckboxPrimitive.Indicator className="text-white">
        <Check className="size-3.5" aria-hidden="true" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
