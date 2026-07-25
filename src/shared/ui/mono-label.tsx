import { cn } from '~/shared/lib/cn'

export interface MonoLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: 'span' | 'div' | 'p'
}

export function MonoLabel({
  as: Tag = 'span',
  className,
  children,
  ...props
}: MonoLabelProps) {
  return (
    <Tag
      className={cn(
        'font-mono text-xs uppercase tracking-[0.08em] text-mute',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
