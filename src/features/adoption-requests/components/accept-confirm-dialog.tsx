import { useState } from 'react'

import { DialogContent, DialogRoot } from '~/shared/ui/dialog'
import { Button } from '~/shared/ui/button'
import { Checkbox } from '~/shared/ui/checkbox'

export interface AcceptConfirmDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  petName: string
  isConfirming?: boolean
  onConfirm: (reservePet: boolean) => void
}

/** Per doc04 §B.8: accepting a request confirms with a "also mark as
 * reserved" checkbox, checked by default. */
export function AcceptConfirmDialog({
  isOpen,
  onOpenChange,
  petName,
  isConfirming = false,
  onConfirm,
}: AcceptConfirmDialogProps) {
  const [reservePet, setReservePet] = useState(true)

  return (
    <DialogRoot open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        size="sm"
        title="Accept request"
        description="The adopter will be able to see your contact details once you accept."
      >
        <label className="flex items-center gap-3 py-2 text-sm text-ink">
          <Checkbox
            checked={reservePet}
            onCheckedChange={(checked) => setReservePet(checked === true)}
          />
          Also mark {petName} as reserved
        </label>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            isLoading={isConfirming}
            onClick={() => onConfirm(reservePet)}
          >
            Accept request
          </Button>
        </div>
      </DialogContent>
    </DialogRoot>
  )
}
