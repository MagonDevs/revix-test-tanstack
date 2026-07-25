import { Button } from '~/shared/ui/button'
import { Field } from '~/shared/ui/field'
import { Input } from '~/shared/ui/input'

/** Static markup only — submit logic arrives in Phase 3. */
export function LoginFormShell() {
  return (
    <form className="flex flex-col gap-4">
      <Field label="Email">
        {({ inputId }) => (
          <Input id={inputId} type="email" autoComplete="email" />
        )}
      </Field>
      <Field label="Password">
        {({ inputId }) => (
          <Input id={inputId} type="password" autoComplete="current-password" />
        )}
      </Field>
      <Button type="submit" className="mt-2">
        Sign in
      </Button>
    </form>
  )
}
