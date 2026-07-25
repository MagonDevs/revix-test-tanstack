import { cn } from '~/shared/lib/cn'

export interface SegmentedOption {
  value: string
  label: string
}

export interface SegmentedControlProps {
  options: SegmentedOption[]
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  'aria-label'?: string
}

export function SegmentedControl({
  options,
  value,
  onValueChange,
  className,
  'aria-label': ariaLabel,
}: SegmentedControlProps) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex rounded-md border border-hairline bg-surface p-0.5',
        className,
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onValueChange?.(option.value)}
            className={cn(
              'rounded-[4px] px-3 py-1.5 text-sm font-medium text-mute outline-none transition-colors focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2',
              isSelected && 'bg-pine-tint text-pine',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
