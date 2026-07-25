import { createFileRoute, Link } from '@tanstack/react-router'

import { EmptyState } from '~/shared/components/empty-state'
import { PageHeader } from '~/shared/components/page-header'
import { Button } from '~/shared/ui/button'
import { TabsList, TabsRoot, TabsTrigger } from '~/shared/ui/tabs'

export const Route = createFileRoute('/_authenticated/dashboard/requests/sent')(
  {
    head: () => ({ meta: [{ title: 'Requests sent · Adopta' }] }),
    component: RequestsSentPage,
  },
)

const TABS = ['Pending', 'Accepted', 'Declined', 'All']

function RequestsSentPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Requests sent" />
      <TabsRoot defaultValue="Pending">
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-4">
          <EmptyState
            message="You haven't asked about any pets yet."
            action={
              <Button asChild variant="secondary">
                <Link to="/pets">Browse pets</Link>
              </Button>
            }
          />
        </div>
      </TabsRoot>
    </div>
  )
}
