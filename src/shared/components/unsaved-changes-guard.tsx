import { useBlocker } from '@tanstack/react-router'

import { ConfirmDialog } from './confirm-dialog'

export interface UnsavedChangesGuardProps {
  /** Block navigation while true (i.e. the form is dirty and not yet saved). */
  when: boolean
}

/**
 * Confirms before navigating away from a dirty form — per doc02 §7's
 * unsaved-changes guard callout for the pet create/edit form. Also arms
 * `beforeunload` for a hard tab close/reload.
 */
export function UnsavedChangesGuard({ when }: UnsavedChangesGuardProps) {
  const { status, proceed, reset } = useBlocker({
    shouldBlockFn: () => when,
    enableBeforeUnload: when,
    withResolver: true,
  })

  return (
    <ConfirmDialog
      isOpen={status === 'blocked'}
      onOpenChange={(isOpen) => {
        if (!isOpen) reset?.()
      }}
      title="Discard your changes?"
      description="You have unsaved changes. If you leave now, they'll be lost."
      confirmLabel="Discard"
      cancelLabel="Keep editing"
      isDestructive
      onConfirm={() => proceed?.()}
    />
  )
}
