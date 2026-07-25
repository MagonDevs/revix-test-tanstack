import { toast } from '~/shared/ui/toast'

import { parseApiError } from './api-error'
import { logger } from './logger'

interface FormLike {
  setErrorMap: (map: {
    onSubmit: { form?: string; fields: Record<string, string> }
  }) => void
}

export interface ReportMutationErrorOptions {
  /** When provided, `validation_error` field details are mapped onto matching form fields. */
  form?: FormLike
  /** Message shown when there's no form in scope, or the error isn't field-mappable. */
  fallbackMessage?: string
}

/**
 * Shared mutation error handler per doc02 §5.7: parses the error, maps
 * `validation_error` details onto form fields when a form is in scope,
 * otherwise shows a toast. Every mutation's onError should funnel through this.
 */
export function reportMutationError(
  error: unknown,
  options: ReportMutationErrorOptions = {},
): void {
  const parsed = parseApiError(error)
  logger.error('mutation.error', { code: parsed.code, status: parsed.status })

  if (
    options.form &&
    parsed.code === 'validation_error' &&
    parsed.details &&
    parsed.details.length > 0
  ) {
    options.form.setErrorMap({
      onSubmit: {
        fields: Object.fromEntries(
          parsed.details.map((fieldError) => [
            fieldError.field,
            fieldError.message,
          ]),
        ),
      },
    })
    return
  }

  if (options.form) {
    options.form.setErrorMap({
      onSubmit: { form: parsed.message, fields: {} },
    })
    return
  }

  toast.error(options.fallbackMessage ?? parsed.message)
}
