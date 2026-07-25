import { Button } from '~/shared/ui/button'
import { Field } from '~/shared/ui/field'
import { Input } from '~/shared/ui/input'

/** Static markup only — submit logic arrives in Phase 3. */
export function RegisterFormShell() {
  return (
    <form className="flex flex-col gap-4">
      <Field label="Name">
        {({ inputId }) => <Input id={inputId} autoComplete="name" />}
      </Field>
      <Field label="Email">
        {({ inputId }) => (
          <Input id={inputId} type="email" autoComplete="email" />
        )}
      </Field>
      <Field label="Password">
        {({ inputId }) => (
          <Input id={inputId} type="password" autoComplete="new-password" />
        )}
      </Field>
      <Field label="Confirm password">
        {({ inputId }) => (
          <Input id={inputId} type="password" autoComplete="new-password" />
        )}
      </Field>
      <Field label="City">
        {({ inputId }) => <Input id={inputId} autoComplete="address-level2" />}
      </Field>
      <Button type="submit" className="mt-2">
        Create account
      </Button>
    </form>
  )
}
