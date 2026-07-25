import { useId } from 'react'

import { cn } from '~/shared/lib/cn'

export interface FieldProps {
  label: string
  hint?: string
  error?: string
  isRequired?: boolean
  className?: string
  children: (ids: {
    inputId: string
    describedBy: string | undefined
  }) => React.ReactNode
}

export function Field({
  label,
  hint,
  error,
  isRequired = false,
  className,
  children,
}: FieldProps) {
  const inputId = useId()
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-ink">
        {label}
        {isRequired ? <span className="text-status-declined"> *</span> : null}
      </label>
      {children({ inputId, describedBy })}
      {hint && !error ? (
        <p id={hintId} className="text-xs text-mute">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs text-status-declined">
          {error}
        </p>
      ) : null}
    </div>
  )
}
