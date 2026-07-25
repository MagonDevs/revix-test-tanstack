import { Tabs as TabsPrimitive } from 'radix-ui'

import { cn } from '~/shared/lib/cn'

export const TabsRoot = TabsPrimitive.Root

export function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        'flex gap-4 overflow-x-auto border-b border-hairline',
        className,
      )}
      {...props}
    />
  )
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'shrink-0 whitespace-nowrap border-b-2 border-transparent px-1 py-2.5 text-sm font-medium text-mute outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 data-[state=active]:border-pine data-[state=active]:text-ink',
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn('focus-visible:outline-none', className)}
      {...props}
    />
  )
}
