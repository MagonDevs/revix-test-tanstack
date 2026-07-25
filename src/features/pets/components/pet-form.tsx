import { useForm } from '@tanstack/react-form'
import { useRef, useState } from 'react'

import { UnsavedChangesGuard } from '~/shared/components/unsaved-changes-guard'
import { Button } from '~/shared/ui/button'
import { Field } from '~/shared/ui/field'
import { Input } from '~/shared/ui/input'
import { MonoLabel } from '~/shared/ui/mono-label'
import { SegmentedControl } from '~/shared/ui/segmented-control'
import { Select } from '~/shared/ui/select'
import { Switch } from '~/shared/ui/switch'
import { Textarea } from '~/shared/ui/textarea'

import { useCreatePet, useUpdatePet } from '../api/pets.mutations'
import {
  petFormSchema,
  toCreatePetRequest,
  toUpdatePetRequest,
  type PetFormValues,
} from '../schemas/pet-form.schema'

import { PetPhotoUploader } from './pet-photo-uploader'

import type { Species, Sex, Size } from '~/contracts'

const SPECIES_OPTIONS: { value: Species; label: string }[] = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'bird', label: 'Bird' },
  { value: 'other', label: 'Other' },
]
const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'unknown', label: 'Unknown' },
]
const SIZE_OPTIONS: { value: Size; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
]
const HEALTH_SWITCHES: {
  key: keyof PetFormValues
  label: string
}[] = [
  { key: 'isVaccinated', label: 'Vaccinated' },
  { key: 'isNeutered', label: 'Neutered' },
  { key: 'isGoodWithKids', label: 'Good with children' },
  { key: 'isGoodWithPets', label: 'Good with other pets' },
]

function toMessage(error: unknown): string | undefined {
  if (!error) return undefined
  if (typeof error === 'string') return error
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message)
  }
  return undefined
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  return 'just now'
}

export interface PetFormProps {
  mode: 'create' | 'edit'
  petId?: string
  initialValues: PetFormValues
  updatedAt?: Date
  onCancel: () => void
  onDeleteRequested?: () => void
}

export function PetForm({
  mode,
  petId,
  initialValues,
  updatedAt,
  onCancel,
  onDeleteRequested,
}: PetFormProps) {
  const formErrorRef = useRef<HTMLParagraphElement>(null)
  const [formError, setFormError] = useState<string | undefined>()

  const formLike = {
    setErrorMap: (map: {
      onSubmit: { form?: string; fields: Record<string, string> }
    }) => {
      setFormError(map.onSubmit.form)
      for (const [field, message] of Object.entries(map.onSubmit.fields)) {
        form.setFieldMeta(field as keyof PetFormValues, (meta) => ({
          ...meta,
          errorMap: { ...meta.errorMap, onSubmit: message },
        }))
      }
      if (map.onSubmit.form) formErrorRef.current?.focus()
    },
  }

  const createPet = useCreatePet(formLike)
  const updatePet = useUpdatePet(petId ?? '', formLike)
  const isPending = createPet.isPending || updatePet.isPending

  const form = useForm({
    defaultValues: initialValues,
    validators: { onBlur: petFormSchema, onSubmit: petFormSchema },
    onSubmit: ({ value }) => {
      setFormError(undefined)
      if (mode === 'create') {
        createPet.mutate(toCreatePetRequest(value))
      } else {
        updatePet.mutate(toUpdatePetRequest(value, initialValues))
      }
    },
  })

  return (
    <form
      className="mx-auto flex max-w-[640px] flex-col gap-8 pb-24"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Subscribe selector={(state) => state.isDirty}>
        {(isDirty) => <UnsavedChangesGuard when={isDirty && !isPending} />}
      </form.Subscribe>

      <section className="flex flex-col gap-3">
        <MonoLabel>Photos</MonoLabel>
        <form.Field name="photos">
          {(field) => (
            <PetPhotoUploader
              photos={field.state.value}
              onChange={(photos) => field.handleChange(photos)}
            />
          )}
        </form.Field>
      </section>

      <section className="flex flex-col gap-4 border-t border-hairline pt-6">
        <MonoLabel>The basics</MonoLabel>
        <form.Field name="name">
          {(field) => {
            const message = toMessage(field.state.meta.errors[0])
            return (
              <Field
                label="Name"
                isRequired
                {...(message ? { error: message } : {})}
              >
                {({ inputId, describedBy }) => (
                  <Input
                    id={inputId}
                    isInvalid={Boolean(message)}
                    {...(describedBy
                      ? { 'aria-describedby': describedBy }
                      : {})}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                )}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="species">
          {(field) => (
            <SegmentedControl
              aria-label="Species"
              options={SPECIES_OPTIONS}
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value as Species)}
            />
          )}
        </form.Field>

        <form.Field name="breed">
          {(field) => (
            <Field label="Breed">
              {({ inputId }) => (
                <Input
                  id={inputId}
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value || null)
                  }
                />
              )}
            </Field>
          )}
        </form.Field>

        <form.Field name="sex">
          {(field) => (
            <SegmentedControl
              aria-label="Sex"
              options={SEX_OPTIONS}
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value as Sex)}
            />
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          <form.Field name="ageMonths">
            {(field) => {
              const message = toMessage(field.state.meta.errors[0])
              return (
                <Field
                  label="Age (months)"
                  isRequired
                  {...(message ? { error: message } : {})}
                >
                  {({ inputId }) => (
                    <Input
                      id={inputId}
                      type="number"
                      min={0}
                      max={360}
                      isInvalid={Boolean(message)}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(Number(event.target.value))
                      }
                    />
                  )}
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="weightKg">
            {(field) => {
              const message = toMessage(field.state.meta.errors[0])
              return (
                <Field
                  label="Weight (kg)"
                  {...(message ? { error: message } : {})}
                >
                  {({ inputId }) => (
                    <Input
                      id={inputId}
                      type="number"
                      step={0.1}
                      min={0.1}
                      max={120}
                      isInvalid={Boolean(message)}
                      value={field.state.value ?? ''}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value === ''
                            ? null
                            : Number(event.target.value),
                        )
                      }
                    />
                  )}
                </Field>
              )
            }}
          </form.Field>
        </div>

        <form.Field name="size">
          {(field) => (
            <Select
              aria-label="Size"
              options={SIZE_OPTIONS}
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value as Size)}
            />
          )}
        </form.Field>
      </section>

      <section className="flex flex-col gap-4 border-t border-hairline pt-6">
        <MonoLabel>About</MonoLabel>
        <form.Field name="description">
          {(field) => {
            const message = toMessage(field.state.meta.errors[0])
            return (
              <Field
                label="Description"
                isRequired
                hint="What is this pet like to live with? Routine, energy, quirks."
                {...(message ? { error: message } : {})}
              >
                {({ inputId, describedBy }) => (
                  <Textarea
                    id={inputId}
                    rows={6}
                    isInvalid={Boolean(message)}
                    {...(describedBy
                      ? { 'aria-describedby': describedBy }
                      : {})}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                )}
              </Field>
            )
          }}
        </form.Field>
      </section>

      <section className="flex flex-col gap-4 border-t border-hairline pt-6">
        <MonoLabel>Health and behaviour</MonoLabel>
        {HEALTH_SWITCHES.map(({ key, label }) => (
          <form.Field key={key} name={key}>
            {(field) => (
              <label className="flex items-center justify-between text-sm text-ink">
                {label}
                <Switch
                  aria-label={label}
                  checked={Boolean(field.state.value)}
                  onCheckedChange={(checked) => field.handleChange(checked)}
                />
              </label>
            )}
          </form.Field>
        ))}
      </section>

      <section className="flex flex-col gap-4 border-t border-hairline pt-6">
        <MonoLabel>Where</MonoLabel>
        <form.Field name="city">
          {(field) => {
            const message = toMessage(field.state.meta.errors[0])
            return (
              <Field
                label="City"
                isRequired
                {...(message ? { error: message } : {})}
              >
                {({ inputId }) => (
                  <Input
                    id={inputId}
                    isInvalid={Boolean(message)}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                )}
              </Field>
            )
          }}
        </form.Field>
      </section>

      {mode === 'edit' && updatedAt ? (
        <div className="flex flex-col gap-3 border-t border-hairline pt-6">
          <MonoLabel>Last updated {timeAgo(updatedAt)}</MonoLabel>
          <Button
            type="button"
            variant="destructive"
            className="self-start"
            onClick={onDeleteRequested}
          >
            Delete listing
          </Button>
        </div>
      ) : null}

      {formError ? (
        <p
          ref={formErrorRef}
          tabIndex={-1}
          role="alert"
          className="text-sm text-status-declined outline-none"
        >
          {formError}
        </p>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 flex justify-end gap-3 border-t border-hairline bg-surface px-5 py-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <form.Subscribe
          selector={(state) => [state.isSubmitting, state.canSubmit] as const}
        >
          {([isSubmitting, canSubmit]) => (
            <Button
              type="submit"
              isLoading={isSubmitting || isPending}
              disabled={!canSubmit || isSubmitting || isPending}
            >
              {mode === 'create' ? 'Publish listing' : 'Save changes'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
