import { useForm } from '@tanstack/react-form'
import { useRef } from 'react'

import { Button } from '~/shared/ui/button'
import { Field } from '~/shared/ui/field'
import { Input } from '~/shared/ui/input'

import { toAuthMutationError, useLogin } from '../api/auth.mutations'
import { toMessage } from '../lib/form-error'
import { loginFormSchema, toLoginRequest } from '../schemas/auth.schemas'

export interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const login = useLogin()
  const formErrorRef = useRef<HTMLParagraphElement>(null)

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onBlur: loginFormSchema, onSubmit: loginFormSchema },
    onSubmit: ({ value, formApi }) => {
      login.mutate(toLoginRequest(value), {
        onSuccess: () => onSuccess(),
        onError: (error) => {
          const mapped = toAuthMutationError(error)
          if (mapped.clearPassword) formApi.setFieldValue('password', '')
          formApi.setErrorMap({
            onSubmit: {
              ...(mapped.formError ? { form: mapped.formError } : {}),
              fields: Object.fromEntries(
                mapped.fieldErrors.map((fieldError) => [
                  fieldError.field,
                  fieldError.message,
                ]),
              ),
            },
          })
          if (mapped.formError) formErrorRef.current?.focus()
        },
      })
    },
  })

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field name="email">
        {(field) => {
          const errors = field.state.meta.errors
          const errorMessage =
            errors.length > 0 ? toMessage(errors[0]) : undefined
          return (
            <Field
              label="Email"
              isRequired
              {...(errorMessage ? { error: errorMessage } : {})}
            >
              {({ inputId, describedBy }) => (
                <Input
                  id={inputId}
                  type="email"
                  autoComplete="email"
                  isInvalid={Boolean(errorMessage)}
                  aria-invalid={Boolean(errorMessage)}
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

      <form.Field name="password">
        {(field) => {
          const errors = field.state.meta.errors
          const errorMessage =
            errors.length > 0 ? toMessage(errors[0]) : undefined
          return (
            <Field
              label="Password"
              isRequired
              {...(errorMessage ? { error: errorMessage } : {})}
            >
              {({ inputId, describedBy }) => (
                <Input
                  id={inputId}
                  type="password"
                  autoComplete="current-password"
                  isInvalid={Boolean(errorMessage)}
                  aria-invalid={Boolean(errorMessage)}
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

      <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
        {(submitError) => {
          const formLevel =
            submitError &&
            typeof submitError === 'object' &&
            'form' in submitError
              ? submitError.form
              : submitError
          const message = toMessage(formLevel)
          return message ? (
            <p
              ref={formErrorRef}
              tabIndex={-1}
              role="alert"
              className="text-sm text-status-declined outline-none"
            >
              {message}
            </p>
          ) : null
        }}
      </form.Subscribe>

      <form.Subscribe
        selector={(state) => [state.isSubmitting, state.canSubmit] as const}
      >
        {([isSubmitting, canSubmit]) => (
          <Button
            type="submit"
            className="mt-2"
            isLoading={isSubmitting}
            disabled={!canSubmit || isSubmitting}
          >
            Sign in
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
