import { useState } from 'react'

import { DialogContent, DialogRoot } from '~/shared/ui/dialog'
import { Button } from '~/shared/ui/button'
import { Textarea } from '~/shared/ui/textarea'
import { MonoLabel } from '~/shared/ui/mono-label'

import { useCreateRequest } from '../api/adoption-requests.mutations'

const MIN_LENGTH = 20
const MAX_LENGTH = 1000

export interface RequestDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  petId: string
  petName: string
}

/** Per doc04 §B.3: pet name in the title, a 20-1000 char message with a live
 * counter, and a mono line stating exactly what the guardian will see. */
export function RequestDialog({
  isOpen,
  onOpenChange,
  petId,
  petName,
}: RequestDialogProps) {
  const [message, setMessage] = useState('')
  const createRequest = useCreateRequest(petId)

  const length = message.trim().length
  const isValid = length >= MIN_LENGTH && length <= MAX_LENGTH

  function handleOpenChange(next: boolean) {
    if (!next) setMessage('')
    onOpenChange(next)
  }

  return (
    <DialogRoot open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        size="md"
        title={`Request to adopt ${petName}`}
        description="Tell the guardian a little about yourself and why you'd be a good fit."
      >
        <div className="flex flex-col gap-3">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Introduce yourself and explain why you'd like to adopt..."
            rows={5}
            minLength={MIN_LENGTH}
            maxLength={MAX_LENGTH}
            aria-label="Message to the guardian"
          />
          <div className="flex items-center justify-between">
            <MonoLabel>
              Your name, city and this message will be shared with the guardian
            </MonoLabel>
            <span className="shrink-0 font-mono text-xs text-mute">
              {length}/{MAX_LENGTH}
            </span>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              disabled={!isValid}
              isLoading={createRequest.isPending}
              onClick={() => {
                createRequest.mutate(
                  { message: message.trim() },
                  { onSuccess: () => handleOpenChange(false) },
                )
              }}
            >
              Send request
            </Button>
          </div>
        </div>
      </DialogContent>
    </DialogRoot>
  )
}
