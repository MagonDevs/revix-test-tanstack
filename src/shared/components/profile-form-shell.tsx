import { Avatar } from '~/shared/ui/avatar'
import { Button } from '~/shared/ui/button'
import { Field } from '~/shared/ui/field'
import { Input } from '~/shared/ui/input'
import { Textarea } from '~/shared/ui/textarea'

export function ProfileFormShell() {
  return (
    <form className="flex max-w-[480px] flex-col gap-4">
      <div className="flex items-center gap-4">
        <Avatar name="Marta Puig" size="lg" />
        <Button variant="secondary" size="sm">
          Change photo
        </Button>
      </div>
      <Field label="Name">
        {({ inputId }) => <Input id={inputId} defaultValue="Marta Puig" />}
      </Field>
      <Field label="Email" hint="Your email can't be changed.">
        {({ inputId }) => (
          <Input
            id={inputId}
            className="font-mono"
            defaultValue="marta@example.com"
            readOnly
          />
        )}
      </Field>
      <Field label="City">
        {({ inputId }) => <Input id={inputId} defaultValue="Barcelona" />}
      </Field>
      <Field label="Phone">
        {({ inputId }) => <Input id={inputId} type="tel" />}
      </Field>
      <Field label="Bio">
        {({ inputId }) => <Textarea id={inputId} rows={4} />}
      </Field>
      <p className="font-mono text-xs uppercase tracking-[0.08em] text-mute">
        Your email and phone are only shared with people whose adoption request
        you accept.
      </p>
    </form>
  )
}
