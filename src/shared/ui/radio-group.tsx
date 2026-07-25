import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'

import { cn } from '~/shared/lib/cn'

export interface RadioOption {
  value: string
  label: string
}

export interface RadioGroupProps {
  options: RadioOption[]
  value?: string
  onValueChange?: (value: string) => void
  isDisabled?: boolean
  className?: string
  name?: string
  'aria-label'?: string
}

export function RadioGroup({
  options,
  value,
  onValueChange,
  isDisabled = false,
  className,
  name,
  'aria-label': ariaLabel,
}: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      {...(value !== undefined ? { value } : {})}
      {...(onValueChange !== undefined ? { onValueChange } : {})}
      disabled={isDisabled}
      {...(name !== undefined ? { name } : {})}
      {...(ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {})}
      className={cn('flex flex-wrap gap-4', className)}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className="flex cursor-pointer items-center gap-2 text-sm text-ink"
        >
          <RadioGroupPrimitive.Item
            value={option.value}
            className="flex size-5 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-pine"
          >
            <RadioGroupPrimitive.Indicator className="size-2.5 rounded-full bg-pine" />
          </RadioGroupPrimitive.Item>
          {option.label}
        </label>
      ))}
    </RadioGroupPrimitive.Root>
  )
}
