import { useForm } from '@tanstack/react-form'
import { useRef } from 'react'

import { Button } from '~/shared/ui/button'
import { Field } from '~/shared/ui/field'
import { Input } from '~/shared/ui/input'

import { toAuthMutationError, useRegister } from '../api/auth.mutations'
import { toMessage } from '../lib/form-error'
import { registerFormSchema, toRegisterRequest } from '../schemas/auth.schemas'

type FieldName = 'name' | 'email' | 'password' | 'confirmPassword' | 'city'

export function RegisterForm() {
  const register = useRegister()
  const formErrorRef = useRef<HTMLParagraphElement>(null)

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      city: '',
    },
    validators: { onBlur: registerFormSchema, onSubmit: registerFormSchema },
    onSubmit: ({ value, formApi }) => {
      register.mutate(toRegisterRequest(value), {
        onError: (error) => {
          const mapped = toAuthMutationError(error)
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

  function renderField(
    name: FieldName,
    label: string,
    type: string,
    autoComplete: string,
  ) {
    return (
      <form.Field name={name}>
        {(field) => {
          const errors = field.state.meta.errors
          const errorMessage =
            errors.length > 0 ? toMessage(errors[0]) : undefined
          return (
            <Field
              label={label}
              isRequired
              {...(errorMessage ? { error: errorMessage } : {})}
            >
              {({ inputId, describedBy }) => (
                <Input
                  id={inputId}
                  type={type}
                  autoComplete={autoComplete}
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
    )
  }

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
      {renderField('name', 'Name', 'text', 'name')}
      {renderField('email', 'Email', 'email', 'email')}
      {renderField('password', 'Password', 'password', 'new-password')}
      {renderField(
        'confirmPassword',
        'Confirm password',
        'password',
        'new-password',
      )}
      {renderField('city', 'City', 'text', 'address-level2')}

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
            Create account
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
