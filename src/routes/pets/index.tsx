import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { SiteHeader } from '~/features/auth'
import {
  petListQuery,
  PetFilterChips,
  PetFilters,
  PetGrid,
  PetSortSelect,
  useUpdatePetSearch,
  petSearchSchema,
} from '~/features/pets'

import { useDebouncedValue } from '~/shared/hooks/use-debounced-value'
import { AppFooter } from '~/shared/components/app-footer'
import { EmptyState } from '~/shared/components/empty-state'
import { ErrorState } from '~/shared/components/error-state'
import { PageHeader } from '~/shared/components/page-header'
import { Button } from '~/shared/ui/button'
import { Input } from '~/shared/ui/input'
import { MonoLabel } from '~/shared/ui/mono-label'
import { Pagination } from '~/shared/ui/pagination'

export const Route = createFileRoute('/pets/')({
  validateSearch: petSearchSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(petListQuery(deps.search)),
  head: () => ({ meta: [{ title: 'Pets looking for a home · Adopta' }] }),
  component: PetsBrowsePage,
  errorComponent: PetsBrowseError,
})

function PetsBrowseError() {
  const router = useRouter()
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-5 py-8">
        <PageHeader title="Browse pets" />
        <ErrorState onRetry={() => void router.invalidate()} />
      </main>
      <AppFooter />
    </div>
  )
}

function PetsBrowsePage() {
  const search = Route.useSearch()
  const updateSearch = useUpdatePetSearch()
  const [qInput, setQInput] = useState(search.q ?? '')
  const debouncedQ = useDebouncedValue(qInput, 400)

  const { data, isFetching } = useSuspenseQuery(petListQuery(search))

  const hasActiveFilters = Boolean(
    search.q ||
    search.species ||
    search.size ||
    search.sex ||
    search.ageGroup ||
    search.city,
  )

  useEffect(() => {
    if (debouncedQ !== (search.q ?? '')) {
      updateSearch({ q: debouncedQ || undefined })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the debounced value settling
  }, [debouncedQ])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-5 py-8">
        <PageHeader title="Browse pets" count={data.meta.total} />

        {
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <aside className="lg:w-60 lg:shrink-0">
              <PetFilters value={search} onChange={updateSearch} />
            </aside>

            <div className="flex flex-1 flex-col gap-5">
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  placeholder="Search pets…"
                  aria-label="Search pets"
                  className="max-w-xs"
                  value={qInput}
                  onChange={(e) => setQInput(e.target.value)}
                />
                <PetSortSelect
                  value={search.sort}
                  onChange={(sort) => updateSearch({ sort })}
                />
                <MonoLabel className="ml-auto">
                  {isFetching ? 'Loading…' : `${data.meta.total} pets`}
                </MonoLabel>
              </div>

              <PetFilterChips
                search={search}
                onRemove={(patch) => updateSearch(patch)}
                onClearAll={() => {
                  setQInput('')
                  updateSearch({
                    q: undefined,
                    species: undefined,
                    size: undefined,
                    sex: undefined,
                    ageGroup: undefined,
                    city: undefined,
                  })
                }}
              />

              {data.items.length === 0 ? (
                hasActiveFilters ? (
                  <EmptyState
                    message="No pets match these filters."
                    action={
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setQInput('')
                          updateSearch({
                            q: undefined,
                            species: undefined,
                            size: undefined,
                            sex: undefined,
                            ageGroup: undefined,
                            city: undefined,
                          })
                        }}
                      >
                        Clear all filters
                      </Button>
                    }
                  />
                ) : (
                  <EmptyState message="No pets have been published yet." />
                )
              ) : (
                <>
                  <PetGrid pets={data.items} />
                  <Pagination
                    page={data.meta.page}
                    totalPages={data.meta.totalPages}
                    onPageChange={(page) => updateSearch({ page })}
                  />
                </>
              )}
            </div>
          </div>
        }
      </main>
      <AppFooter />
    </div>
  )
}
