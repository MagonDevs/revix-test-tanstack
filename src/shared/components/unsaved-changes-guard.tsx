import { useBlocker } from '@tanstack/react-router'

import { ConfirmDialog } from './confirm-dialog'

export interface UnsavedChangesGuardProps {
  when: boolean
}

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
