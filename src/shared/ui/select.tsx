import { Check, ChevronDown } from 'lucide-react'
import { Select as SelectPrimitive } from 'radix-ui'

import { cn } from '~/shared/lib/cn'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  isDisabled?: boolean
  className?: string
  'aria-label'?: string
}

export function Select({
  options,
  value,
  onValueChange,
  placeholder = 'Select…',
  isDisabled = false,
  className,
  'aria-label': ariaLabel,
}: SelectProps) {
  return (
    <SelectPrimitive.Root
      {...(value !== undefined ? { value } : {})}
      {...(onValueChange !== undefined ? { onValueChange } : {})}
      disabled={isDisabled}
    >
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-md border border-hairline bg-surface px-3 text-sm text-ink outline-none focus-visible:border-pine focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-mute',
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown className="size-4 text-mute" aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="z-50 overflow-hidden rounded-lg border border-hairline bg-surface shadow-overlay"
          position="popper"
          sideOffset={4}
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="relative flex h-9 cursor-pointer select-none items-center rounded-sm px-2 pr-8 text-sm text-ink outline-none data-[highlighted]:bg-pine-tint data-[state=checked]:font-medium"
              >
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2 inline-flex items-center">
                  <Check className="size-4 text-pine" aria-hidden="true" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
