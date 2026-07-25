import { Button } from '~/shared/ui/button'
import { Field } from '~/shared/ui/field'
import { Input } from '~/shared/ui/input'
import { MonoLabel } from '~/shared/ui/mono-label'
import { SegmentedControl } from '~/shared/ui/segmented-control'
import { Switch } from '~/shared/ui/switch'
import { Textarea } from '~/shared/ui/textarea'

export interface PetFormShellProps {
  mode: 'create' | 'edit'
}

const SPECIES_OPTIONS = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
]

const HEALTH_SWITCHES = [
  'Vaccinated',
  'Neutered',
  'Good with children',
  'Good with other pets',
]

export function PetFormShell({ mode }: PetFormShellProps) {
  return (
    <form className="mx-auto flex max-w-[640px] flex-col gap-8 pb-24">
      <section className="flex flex-col gap-3">
        <MonoLabel>Photos</MonoLabel>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex size-24 items-center justify-center rounded-md border border-dashed border-hairline text-xs text-mute">
            Cover
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-hairline pt-6">
        <MonoLabel>The basics</MonoLabel>
        <Field label="Name">{({ inputId }) => <Input id={inputId} />}</Field>
        <SegmentedControl
          aria-label="Species"
          options={SPECIES_OPTIONS}
          value="dog"
        />
        <Field label="Breed">{({ inputId }) => <Input id={inputId} />}</Field>
      </section>

      <section className="flex flex-col gap-4 border-t border-hairline pt-6">
        <MonoLabel>About</MonoLabel>
        <Field
          label="Description"
          hint="What is this pet like to live with? Routine, energy, quirks."
        >
          {({ inputId }) => <Textarea id={inputId} rows={6} />}
        </Field>
      </section>

      <section className="flex flex-col gap-4 border-t border-hairline pt-6">
        <MonoLabel>Health and behaviour</MonoLabel>
        {HEALTH_SWITCHES.map((label) => (
          <label
            key={label}
            className="flex items-center justify-between text-sm text-ink"
          >
            {label}
            <Switch aria-label={label} />
          </label>
        ))}
      </section>

      <section className="flex flex-col gap-4 border-t border-hairline pt-6">
        <MonoLabel>Where</MonoLabel>
        <Field label="City">{({ inputId }) => <Input id={inputId} />}</Field>
      </section>

      {mode === 'edit' ? (
        <div className="flex flex-col gap-3 border-t border-hairline pt-6">
          <MonoLabel>Last updated 2 days ago</MonoLabel>
          <Button variant="destructive" className="self-start">
            Delete listing
          </Button>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 flex justify-end gap-3 border-t border-hairline bg-surface px-5 py-3">
        <Button variant="ghost">Cancel</Button>
        <Button type="submit">
          {mode === 'create' ? 'Publish listing' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
