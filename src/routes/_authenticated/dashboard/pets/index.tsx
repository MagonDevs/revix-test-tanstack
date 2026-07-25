import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'

import { myPetsQuery } from '~/features/pets/api/pets.queries'
import { PetListingRow } from '~/features/pets/components/pet-listing-row'

import { EmptyState } from '~/shared/components/empty-state'
import { PageHeader } from '~/shared/components/page-header'
import { Button } from '~/shared/ui/button'
import { TabsList, TabsRoot, TabsTrigger } from '~/shared/ui/tabs'

const TAB_VALUES = [
  'all',
  'available',
  'reserved',
  'adopted',
  'withdrawn',
] as const
type TabValue = (typeof TAB_VALUES)[number]

const searchSchema = z.object({
  status: z.enum(TAB_VALUES).default('all'),
  page: z.coerce.number().int().positive().default(1),
})

export const Route = createFileRoute('/_authenticated/dashboard/pets/')({
  head: () => ({ meta: [{ title: 'My listings · Adopta' }] }),
  validateSearch: searchSchema,
  component: MyListingsPage,
})

const TAB_LABELS: Record<TabValue, string> = {
  all: 'All',
  available: 'Available',
  reserved: 'Reserved',
  adopted: 'Adopted',
  withdrawn: 'Withdrawn',
}

const EMPTY_MESSAGES: Record<TabValue, string> = {
  all: "You haven't published any pets yet.",
  available: 'No available pets right now.',
  reserved: 'No reserved pets right now.',
  adopted: 'No adopted pets yet.',
  withdrawn: 'No withdrawn listings.',
}

function MyListingsPage() {
  const { status } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  // A single unfiltered call feeds every tab's count and content — cheaper
  // than one status-scoped request per tab per doc04 §B.6.
  const { data, isLoading } = useQuery(myPetsQuery())

  const items = data?.items ?? []
  const counts: Record<TabValue, number> = {
    all: items.length,
    available: items.filter((pet) => pet.status === 'available').length,
    reserved: items.filter((pet) => pet.status === 'reserved').length,
    adopted: items.filter((pet) => pet.status === 'adopted').length,
    withdrawn: items.filter((pet) => pet.status === 'withdrawn').length,
  }
  const visible =
    status === 'all' ? items : items.filter((pet) => pet.status === status)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My listings"
        count={items.length}
        action={
          <Button asChild>
            <Link to="/dashboard/pets/new">Publish a pet</Link>
          </Button>
        }
      />
      <TabsRoot
        value={status}
        onValueChange={(value) => {
          void navigate({ search: { status: value as TabValue, page: 1 } })
        }}
      >
        <TabsList>
          {TAB_VALUES.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {TAB_LABELS[tab]} ({counts[tab]})
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-4">
          {isLoading ? null : visible.length === 0 ? (
            <EmptyState
              message={EMPTY_MESSAGES[status]}
              action={
                status === 'all' ? (
                  <Button asChild>
                    <Link to="/dashboard/pets/new">Publish a pet</Link>
                  </Button>
                ) : undefined
              }
            />
          ) : (
            visible.map((pet) => <PetListingRow key={pet.id} pet={pet} />)
          )}
        </div>
      </TabsRoot>
    </div>
  )
}
