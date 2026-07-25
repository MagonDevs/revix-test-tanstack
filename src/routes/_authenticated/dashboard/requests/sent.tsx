import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'

import { requestsQuery, RequestPanel } from '~/features/adoption-requests'

import { EmptyState } from '~/shared/components/empty-state'
import { PageHeader } from '~/shared/components/page-header'
import { Button } from '~/shared/ui/button'
import { TabsList, TabsRoot, TabsTrigger } from '~/shared/ui/tabs'

const TAB_VALUES = ['pending', 'accepted', 'declined', 'all'] as const
type TabValue = (typeof TAB_VALUES)[number]

const searchSchema = z.object({
  status: z.enum(TAB_VALUES).default('pending'),
})

export const Route = createFileRoute('/_authenticated/dashboard/requests/sent')(
  {
    head: () => ({ meta: [{ title: 'Requests sent · Adopta' }] }),
    validateSearch: searchSchema,
    component: RequestsSentPage,
  },
)

const TAB_LABELS: Record<TabValue, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  all: 'All',
}

function RequestsSentPage() {
  const { status } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data, isLoading } = useQuery(requestsQuery({ role: 'adopter' }))

  const items = data?.items ?? []
  const visible =
    status === 'all' ? items : items.filter((r) => r.status === status)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Requests sent" count={items.length} />
      <TabsRoot
        value={status}
        onValueChange={(value) => {
          void navigate({ search: { status: value as TabValue } })
        }}
      >
        <TabsList>
          {TAB_VALUES.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {TAB_LABELS[tab]}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-4 flex flex-col gap-4">
          {isLoading ? null : visible.length === 0 ? (
            <EmptyState
              message="You haven't asked about any pets yet."
              action={
                <Button asChild variant="secondary">
                  <Link to="/pets">Browse pets</Link>
                </Button>
              }
            />
          ) : (
            visible.map((request) => (
              <RequestPanel
                key={request.id}
                request={request}
                direction="sent"
              />
            ))
          )}
        </div>
      </TabsRoot>
    </div>
  )
}
