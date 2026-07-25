import { createFileRoute } from '@tanstack/react-router'

import { EmptyState } from '~/shared/components/empty-state'
import { PageHeader } from '~/shared/components/page-header'
import { TabsList, TabsRoot, TabsTrigger } from '~/shared/ui/tabs'

export const Route = createFileRoute(
  '/_authenticated/dashboard/requests/received',
)({
  head: () => ({ meta: [{ title: 'Requests received · Adopta' }] }),
  component: RequestsReceivedPage,
})

const TABS = ['Pending', 'Accepted', 'Declined', 'All']

function RequestsReceivedPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Requests received" />
      <TabsRoot defaultValue="Pending">
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-4">
          <EmptyState message="No pending requests. When someone asks about one of your pets, it'll show up here." />
        </div>
      </TabsRoot>
    </div>
  )
}
