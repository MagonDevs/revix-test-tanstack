import { useForm } from '@tanstack/react-form'
import { useRef, useState } from 'react'

import { useUploadPhoto } from '~/features/pets/api/pets.mutations'

import { Avatar } from '~/shared/ui/avatar'
import { Button } from '~/shared/ui/button'
import { Field } from '~/shared/ui/field'
import { Input } from '~/shared/ui/input'
import { Textarea } from '~/shared/ui/textarea'
import { toast } from '~/shared/ui/toast'

import { useUpdateProfile } from '../api/profile.mutations'
import {
  profileFormSchema,
  toUpdateUserRequest,
  type ProfileFormValues,
} from '../schemas/profile-form.schema'

import type { SessionUserDto } from '~/contracts'

export interface ProfileFormProps {
  user: SessionUserDto
}

function toMessage(error: unknown): string | undefined {
  if (!error) return undefined
  if (typeof error === 'string') return error
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message)
  }
  return undefined
}

/**
 * `/dashboard/profile`'s form per doc04 §B.11 — avatar + `Change photo`,
 * name/email(read-only, mono)/city/phone/bio, a sticky save bar that only
 * appears while the form is dirty, and the mono privacy footnote.
 */
export function ProfileForm({ user }: ProfileFormProps) {
  const formErrorRef = useRef<HTMLParagraphElement>(null)
  const [formError, setFormError] = useState<string | undefined>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initialValues: ProfileFormValues = {
    name: user.name,
    city: user.city,
    phone: user.phone,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
  }

  const formLike = {
    setErrorMap: (map: {
      onSubmit: { form?: string; fields: Record<string, string> }
    }) => {
      setFormError(map.onSubmit.form)
      for (const [field, message] of Object.entries(map.onSubmit.fields)) {
        form.setFieldMeta(field as keyof ProfileFormValues, (meta) => ({
          ...meta,
          errorMap: { ...meta.errorMap, onSubmit: message },
        }))
      }
      if (map.onSubmit.form) formErrorRef.current?.focus()
    },
  }

  const updateProfile = useUpdateProfile(formLike)
  const uploadPhoto = useUploadPhoto()

  const form = useForm({
    defaultValues: initialValues,
    validators: { onBlur: profileFormSchema, onSubmit: profileFormSchema },
    onSubmit: ({ value }) => {
      setFormError(undefined)
      const diff = toUpdateUserRequest(value, initialValues)
      if (Object.keys(diff).length === 0) return
      updateProfile.mutate(diff, {
        onSuccess: () => form.reset(value),
      })
    },
  })

  function handleAvatarChange(fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) return
    uploadPhoto.mutate(file, {
      onSuccess: (dto) => form.setFieldValue('avatarUrl', dto.url),
      onError: () => toast.error('Photo upload failed.'),
    })
  }

  return (
    <form
      className="mx-auto flex max-w-[480px] flex-col gap-5 pb-24"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      {formError ? (
        <p
          ref={formErrorRef}
          tabIndex={-1}
          className="text-sm text-status-declined outline-none"
        >
          {formError}
        </p>
      ) : null}

      <form.Field name="avatarUrl">
        {(field) => (
          <div className="flex items-center gap-4">
            <Avatar
              {...(field.state.value ? { src: field.state.value } : {})}
              name={user.name}
              size="lg"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => handleAvatarChange(event.target.files)}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              isLoading={uploadPhoto.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              Change photo
            </Button>
          </div>
        )}
      </form.Field>

      <form.Field name="name">
        {(field) => {
          const message = toMessage(field.state.meta.errorMap.onSubmit)
          return (
            <Field
              label="Name"
              isRequired
              {...(message ? { error: message } : {})}
            >
              {({ inputId, describedBy }) => (
                <Input
                  id={inputId}
                  {...(describedBy ? { 'aria-describedby': describedBy } : {})}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              )}
            </Field>
          )
        }}
      </form.Field>

      <Field label="Email" hint="Your email can't be changed.">
        {({ inputId }) => (
          <Input
            id={inputId}
            defaultValue={user.email}
            readOnly
            className="font-mono text-sm"
          />
        )}
      </Field>

      <form.Field name="city">
        {(field) => {
          const message = toMessage(field.state.meta.errorMap.onSubmit)
          return (
            <Field
              label="City"
              isRequired
              {...(message ? { error: message } : {})}
            >
              {({ inputId, describedBy }) => (
                <Input
                  id={inputId}
                  {...(describedBy ? { 'aria-describedby': describedBy } : {})}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              )}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="phone">
        {(field) => {
          const message = toMessage(field.state.meta.errorMap.onSubmit)
          return (
            <Field label="Phone" {...(message ? { error: message } : {})}>
              {({ inputId, describedBy }) => (
                <Input
                  id={inputId}
                  type="tel"
                  {...(describedBy ? { 'aria-describedby': describedBy } : {})}
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value || null)
                  }
                />
              )}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="bio">
        {(field) => {
          const message = toMessage(field.state.meta.errorMap.onSubmit)
          return (
            <Field label="Bio" {...(message ? { error: message } : {})}>
              {({ inputId, describedBy }) => (
                <Textarea
                  id={inputId}
                  rows={4}
                  {...(describedBy ? { 'aria-describedby': describedBy } : {})}
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value || null)
                  }
                />
              )}
            </Field>
          )
        }}
      </form.Field>

      <p className="font-mono text-xs uppercase tracking-[0.08em] text-mute">
        Your email and phone are only shared with people whose adoption request
        you accept.
      </p>

      <form.Subscribe selector={(state) => state.isDirty}>
        {(isDirty) =>
          isDirty ? (
            <div className="fixed inset-x-0 bottom-0 z-10 border-t border-hairline bg-surface p-4">
              <div className="mx-auto flex max-w-[480px] items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => form.reset(initialValues)}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={updateProfile.isPending}>
                  Save changes
                </Button>
              </div>
            </div>
          ) : null
        }
      </form.Subscribe>
    </form>
  )
}
