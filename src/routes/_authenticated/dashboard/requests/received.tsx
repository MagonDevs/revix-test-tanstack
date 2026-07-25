import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { requestsQuery } from '~/features/adoption-requests/api/adoption-requests.queries'
import { RequestPanel } from '~/features/adoption-requests/components/request-panel'

import { EmptyState } from '~/shared/components/empty-state'
import { PageHeader } from '~/shared/components/page-header'
import { TabsList, TabsRoot, TabsTrigger } from '~/shared/ui/tabs'

const TAB_VALUES = ['pending', 'accepted', 'declined', 'all'] as const
type TabValue = (typeof TAB_VALUES)[number]

const searchSchema = z.object({
  status: z.enum(TAB_VALUES).default('pending'),
  petId: z.string().optional(),
})

export const Route = createFileRoute(
  '/_authenticated/dashboard/requests/received',
)({
  head: () => ({ meta: [{ title: 'Requests received · Adopta' }] }),
  validateSearch: searchSchema,
  component: RequestsReceivedPage,
})

const TAB_LABELS: Record<TabValue, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  all: 'All',
}

function RequestsReceivedPage() {
  const { status, petId } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data, isLoading } = useQuery(requestsQuery({ role: 'guardian' }))

  const items = data?.items ?? []
  const scoped = petId ? items.filter((r) => r.pet.id === petId) : items
  const visible =
    status === 'all' ? scoped : scoped.filter((r) => r.status === status)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Requests received" count={items.length} />
      <TabsRoot
        value={status}
        onValueChange={(value) => {
          void navigate({ search: { status: value as TabValue, petId } })
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
            <EmptyState message="No pending requests. When someone asks about one of your pets, it'll show up here." />
          ) : (
            visible.map((request) => (
              <RequestPanel
                key={request.id}
                request={request}
                direction="received"
              />
            ))
          )}
        </div>
      </TabsRoot>
    </div>
  )
}
