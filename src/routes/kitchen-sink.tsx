import { createFileRoute, notFound } from '@tanstack/react-router'
import { Heart, Plus } from 'lucide-react'
import { useState } from 'react'

import { Avatar } from '~/shared/ui/avatar'
import { Button } from '~/shared/ui/button'
import { Card } from '~/shared/ui/card'
import { Checkbox } from '~/shared/ui/checkbox'
import { Chip } from '~/shared/ui/chip'
import { Combobox } from '~/shared/ui/combobox'
import { DialogContent, DialogRoot, DialogTrigger } from '~/shared/ui/dialog'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '~/shared/ui/dropdown-menu'
import { Field } from '~/shared/ui/field'
import { Input } from '~/shared/ui/input'
import { MonoLabel } from '~/shared/ui/mono-label'
import { Pagination } from '~/shared/ui/pagination'
import { Progress } from '~/shared/ui/progress'
import { RadioGroup } from '~/shared/ui/radio-group'
import { SegmentedControl } from '~/shared/ui/segmented-control'
import { Select } from '~/shared/ui/select'
import { SheetContent, SheetRoot, SheetTrigger } from '~/shared/ui/sheet'
import { Skeleton } from '~/shared/ui/skeleton'
import { Spinner } from '~/shared/ui/spinner'
import { StatusStamp } from '~/shared/ui/status-stamp'
import { Switch } from '~/shared/ui/switch'
import { TabsList, TabsRoot, TabsTrigger, TabsContent } from '~/shared/ui/tabs'
import { Textarea } from '~/shared/ui/textarea'
import { toast } from '~/shared/ui/toast'
import { Tooltip, TooltipProvider } from '~/shared/ui/tooltip'
import { ConfirmDialog } from '~/shared/components/confirm-dialog'
import { EmptyState } from '~/shared/components/empty-state'
import { ErrorState } from '~/shared/components/error-state'
import { PageHeader } from '~/shared/components/page-header'
import type { StampStatus } from '~/shared/ui/status-stamp'

export const Route = createFileRoute('/kitchen-sink')({
  // Dev-only design system review page — 404s in production builds.
  beforeLoad: () => {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack's notFound() is thrown by design
    if (!import.meta.env.DEV) throw notFound()
  },
  head: () => ({ meta: [{ title: 'Kitchen sink · Adopta' }] }),
  component: KitchenSinkPage,
})

const STATUSES: StampStatus[] = [
  'available',
  'reserved',
  'adopted',
  'withdrawn',
  'pending',
  'accepted',
  'declined',
]

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 border-t border-hairline pt-8">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </section>
  )
}

function KitchenSinkPage() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [radioValue, setRadioValue] = useState('dog')
  const [segmentValue, setSegmentValue] = useState('small')
  const [comboValue, setComboValue] = useState('')
  const [switchOn, setSwitchOn] = useState(true)
  const [checked, setChecked] = useState<boolean | 'indeterminate'>(
    'indeterminate',
  )

  return (
    <TooltipProvider>
      <main className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 py-8">
        <PageHeader title="Kitchen sink" count={STATUSES.length} />
        <p className="max-w-[68ch] text-sm text-mute">
          Dev-only route rendering every shared primitive in every variant and
          state, for visual review. Not included in production builds.
        </p>

        <Section title="Button">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button iconOnly aria-label="Add">
              <Plus className="size-4" />
            </Button>
            <Button isLoading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        <Section title="Input / Textarea / Field">
          <Field label="Name" isRequired className="w-64">
            {({ inputId }) => <Input id={inputId} placeholder="Nala" />}
          </Field>
          <Field
            label="Email"
            error="Email or password is incorrect."
            className="w-64"
          >
            {({ inputId, describedBy }) => (
              <Input id={inputId} isInvalid aria-describedby={describedBy} />
            )}
          </Field>
          <Input placeholder="Disabled" disabled className="w-48" />
          <Input prefix="€" placeholder="0.00" className="w-48" />
          <Textarea placeholder="Description" rows={3} className="w-64" />
        </Section>

        <Section title="Select / Combobox">
          <Select
            aria-label="Sort"
            placeholder="Sort by"
            options={[
              { value: 'newest', label: 'Newest' },
              { value: 'oldest', label: 'Oldest' },
            ]}
          />
          <Combobox
            aria-label="Breed"
            options={['Labrador', 'Podenco', 'Poodle']}
            value={comboValue}
            onValueChange={setComboValue}
            placeholder="Breed"
          />
        </Section>

        <Section title="Checkbox / RadioGroup / Switch">
          <Checkbox
            checked={checked}
            onCheckedChange={setChecked}
            aria-label="Checkbox"
          />
          <RadioGroup
            aria-label="Species"
            value={radioValue}
            onValueChange={setRadioValue}
            options={[
              { value: 'dog', label: 'Dog' },
              { value: 'cat', label: 'Cat' },
            ]}
          />
          <Switch
            checked={switchOn}
            onCheckedChange={setSwitchOn}
            aria-label="Vaccinated"
          />
        </Section>

        <Section title="SegmentedControl">
          <SegmentedControl
            aria-label="Size"
            value={segmentValue}
            onValueChange={setSegmentValue}
            options={[
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' },
            ]}
          />
        </Section>

        <Section title="Card / Avatar / Chip / StatusStamp">
          <Card className="w-48 p-4 text-sm">Default card</Card>
          <Card isInteractive className="w-48 p-4 text-sm">
            Interactive card
          </Card>
          <Avatar name="Marta Puig" size="sm" />
          <Avatar name="Marta Puig" size="md" />
          <Avatar name="Marta Puig" size="lg" />
          <Chip variant="filter" onRemove={() => undefined}>
            Dog
          </Chip>
          <Chip variant="static">Static</Chip>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((status) => (
              <StatusStamp key={status} status={status} />
            ))}
          </div>
        </Section>

        <Section title="MonoLabel / Skeleton / Spinner / Progress">
          <MonoLabel>Dog · 1y 6m · Medium</MonoLabel>
          <Skeleton variant="text" className="w-40" />
          <Skeleton variant="avatar" />
          <Skeleton variant="block" className="w-40" />
          <Spinner size="sm" />
          <Spinner size="md" />
          <Progress value={64} aria-label="Upload progress" className="w-40" />
        </Section>

        <Section title="Tabs">
          <TabsRoot defaultValue="one" className="w-full">
            <TabsList>
              <TabsTrigger value="one">Pending</TabsTrigger>
              <TabsTrigger value="two">Accepted</TabsTrigger>
            </TabsList>
            <TabsContent value="one" className="pt-3 text-sm text-mute">
              Pending panel
            </TabsContent>
            <TabsContent value="two" className="pt-3 text-sm text-mute">
              Accepted panel
            </TabsContent>
          </TabsRoot>
        </Section>

        <Section title="DropdownMenu">
          <DropdownMenuRoot>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">Open menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Mark as adopted</DropdownMenuItem>
              <DropdownMenuItem isDestructive>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuRoot>
        </Section>

        <Section title="Dialog / ConfirmDialog">
          <DialogRoot>
            <DialogTrigger asChild>
              <Button variant="secondary">Open dialog</Button>
            </DialogTrigger>
            <DialogContent
              title="Request to adopt Nala"
              description="Send a message to the guardian."
            >
              <Textarea rows={4} placeholder="Tell them about yourself…" />
            </DialogContent>
          </DialogRoot>
          <Button variant="destructive" onClick={() => setIsConfirmOpen(true)}>
            Delete listing
          </Button>
          <ConfirmDialog
            isOpen={isConfirmOpen}
            onOpenChange={setIsConfirmOpen}
            title="Delete listing"
            description="This removes Nala and all requests for her. This can't be undone."
            confirmLabel="Delete listing"
            isDestructive
            onConfirm={() => setIsConfirmOpen(false)}
          />
        </Section>

        <Section title="Sheet">
          <SheetRoot open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="secondary">Open sheet</Button>
            </SheetTrigger>
            <SheetContent side="bottom" title="Filters">
              <p className="text-sm text-mute">Filter controls go here.</p>
            </SheetContent>
          </SheetRoot>
        </Section>

        <Section title="Tooltip">
          <Tooltip content="Save to favourites">
            <Button iconOnly aria-label="Favourite">
              <Heart className="size-4" />
            </Button>
          </Tooltip>
        </Section>

        <Section title="Toast">
          <Button
            variant="secondary"
            onClick={() => toast.success('Nala is published')}
          >
            Success toast
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.error("We couldn't save your listing.")}
          >
            Error toast
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.info('Request sent to Marta')}
          >
            Info toast
          </Button>
        </Section>

        <Section title="Pagination">
          <Pagination page={3} totalPages={8} onPageChange={() => undefined} />
        </Section>

        <Section title="EmptyState / ErrorState">
          <EmptyState message="Nothing saved yet. Tap the heart on any pet to keep it here." />
          <ErrorState onRetry={() => undefined} />
        </Section>
      </main>
    </TooltipProvider>
  )
}
