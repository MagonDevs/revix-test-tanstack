import { Check } from 'lucide-react'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { useState } from 'react'

import { cn } from '~/shared/lib/cn'
import { Input } from '~/shared/ui/input'

export interface ComboboxProps {
  options: string[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  'aria-label'?: string
}

/** Free text is always allowed — suggestions narrow, they never constrain. */
export function Combobox({
  options,
  value = '',
  onValueChange,
  placeholder,
  className,
  'aria-label': ariaLabel,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const matches = options.filter((option) =>
    option.toLowerCase().includes(value.toLowerCase()),
  )

  return (
    <PopoverPrimitive.Root
      open={isOpen && matches.length > 0}
      onOpenChange={setIsOpen}
    >
      <PopoverPrimitive.Anchor asChild>
        <Input
          aria-label={ariaLabel}
          value={value}
          placeholder={placeholder}
          className={className}
          onChange={(event) => {
            onValueChange(event.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
        />
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          onOpenAutoFocus={(event) => event.preventDefault()}
          sideOffset={4}
          className="z-50 max-h-56 w-[--radix-popover-trigger-width] overflow-y-auto rounded-lg border border-hairline bg-surface p-1 shadow-overlay"
        >
          {matches.map((option) => (
            <button
              key={option}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault()
                onValueChange(option)
                setIsOpen(false)
              }}
              className={cn(
                'flex h-9 w-full cursor-pointer items-center justify-between rounded-sm px-2 text-left text-sm text-ink hover:bg-pine-tint',
              )}
            >
              {option}
              {option === value ? (
                <Check className="size-4 text-pine" aria-hidden="true" />
              ) : null}
            </button>
          ))}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
