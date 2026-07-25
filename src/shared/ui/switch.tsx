import { Switch as SwitchPrimitive } from 'radix-ui'

import { cn } from '~/shared/lib/cn'

export interface SwitchProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  isDisabled?: boolean
  id?: string
  className?: string
  'aria-label'?: string
}

export function Switch({
  checked,
  onCheckedChange,
  isDisabled = false,
  id,
  className,
  'aria-label': ariaLabel,
}: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      {...(id !== undefined ? { id } : {})}
      {...(checked !== undefined ? { checked } : {})}
      {...(onCheckedChange !== undefined ? { onCheckedChange } : {})}
      disabled={isDisabled}
      {...(ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {})}
      className={cn(
        'relative h-6 w-10 shrink-0 rounded-full border border-hairline bg-hairline outline-none transition-colors focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-pine data-[state=checked]:bg-pine',
        className,
      )}
    >
      <SwitchPrimitive.Thumb className="block size-4 translate-x-0.5 rounded-full bg-white transition-transform duration-150 ease-out data-[state=checked]:translate-x-[18px]" />
    </SwitchPrimitive.Root>
  )
}
