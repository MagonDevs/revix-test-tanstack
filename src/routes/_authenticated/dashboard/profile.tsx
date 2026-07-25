import { createFileRoute } from '@tanstack/react-router'

import { PageHeader } from '~/shared/components/page-header'
import { Avatar } from '~/shared/ui/avatar'
import { Button } from '~/shared/ui/button'
import { Field } from '~/shared/ui/field'
import { Input } from '~/shared/ui/input'
import { Textarea } from '~/shared/ui/textarea'

export const Route = createFileRoute('/_authenticated/dashboard/profile')({
  head: () => ({ meta: [{ title: 'Profile · Adopta' }] }),
  component: ProfilePage,
})

function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Profile" />
      <form className="flex max-w-[480px] flex-col gap-5">
        <div className="flex items-center gap-4">
          <Avatar name="Marta Puig" size="lg" />
          <Button type="button" variant="secondary" size="sm">
            Change photo
          </Button>
        </div>
        <Field label="Name" isRequired>
          {({ inputId }) => <Input id={inputId} defaultValue="Marta Puig" />}
        </Field>
        <Field label="Email" hint="Your email can't be changed.">
          {({ inputId }) => (
            <Input
              id={inputId}
              defaultValue="marta@example.com"
              readOnly
              className="font-mono text-sm"
            />
          )}
        </Field>
        <Field label="City" isRequired>
          {({ inputId }) => <Input id={inputId} defaultValue="Barcelona" />}
        </Field>
        <Field label="Phone">
          {({ inputId }) => <Input id={inputId} type="tel" />}
        </Field>
        <Field label="Bio">
          {({ inputId }) => <Textarea id={inputId} rows={4} />}
        </Field>
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-mute">
          Your email and phone are only shared with people whose adoption
          request you accept.
        </p>
      </form>
    </div>
  )
}
