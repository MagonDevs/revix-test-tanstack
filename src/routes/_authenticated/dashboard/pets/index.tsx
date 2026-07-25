import { createFileRoute } from '@tanstack/react-router'

import { PageHeader } from '~/shared/components/page-header'
import { PetListingRowShell } from '~/shared/components/pet-listing-row-shell'
import { TabsList, TabsRoot, TabsTrigger } from '~/shared/ui/tabs'
import { Button } from '~/shared/ui/button'

export const Route = createFileRoute('/_authenticated/dashboard/pets/')({
  head: () => ({ meta: [{ title: 'My listings · Adopta' }] }),
  component: MyListingsPage,
})

const TABS = ['All', 'Available', 'Reserved', 'Adopted', 'Withdrawn']

function MyListingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My listings"
        count={0}
        action={<Button>Publish a pet</Button>}
      />
      <TabsRoot defaultValue="All">
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-4">
          <PetListingRowShell
            name="Nala"
            status="available"
            pendingRequestCount={3}
          />
          <PetListingRowShell name="Toby" status="reserved" />
        </div>
      </TabsRoot>
    </div>
  )
}
