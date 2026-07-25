import { DialogContent, DialogRoot } from '~/shared/ui/dialog'
import { Button } from '~/shared/ui/button'

export interface ConfirmDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  isDestructive?: boolean
  isConfirming?: boolean
  onConfirm: () => void
}

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isConfirming = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <DialogRoot open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent size="sm" title={title} description={description}>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'primary'}
            isLoading={isConfirming}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </DialogRoot>
  )
}
