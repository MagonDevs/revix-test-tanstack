import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { ConfirmDialog } from '~/shared/components/confirm-dialog'
import { Avatar } from '~/shared/ui/avatar'
import { Button } from '~/shared/ui/button'

import {
  useRespondToRequest,
  useWithdrawRequest,
} from '../api/adoption-requests.mutations'

import { AcceptConfirmDialog } from './accept-confirm-dialog'
import { ContactBlock } from './contact-block'
import { RequestStatusStamp } from './request-status-stamp'

import type { AdoptionRequest } from '../model/adoption-request.model'

export interface RequestPanelProps {
  request: AdoptionRequest
  direction: 'received' | 'sent'
}

const RELATIVE_FORMATTER = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
})

function formatRelativeDate(date: Date): string {
  const diffMs = date.getTime() - Date.now()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.round(diffMs / (1000 * 60 * 60))
    return RELATIVE_FORMATTER.format(diffHours, 'hour')
  }
  return RELATIVE_FORMATTER.format(diffDays, 'day')
}

/** Shared panel for both received and sent lists per doc04 §B.8/B.9. */
export function RequestPanel({ request, direction }: RequestPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAcceptOpen, setIsAcceptOpen] = useState(false)
  const [isDeclineOpen, setIsDeclineOpen] = useState(false)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)

  const respond = useRespondToRequest(request.id)
  const withdraw = useWithdrawRequest()

  const person = direction === 'received' ? request.adopter : request.guardian
  const isPending = request.status === 'pending'
  const isLongMessage = request.message.length > 240

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-hairline p-4">
      <div className="flex items-center gap-3">
        <Avatar name={person.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">
            {person.name} · {person.city}
          </p>
          <p className="text-sm text-mute">
            {direction === 'received' ? 'wants to adopt' : 'you asked about'}{' '}
            <Link
              to="/pets/$petId"
              params={{ petId: request.pet.id }}
              className="font-medium text-ink underline-offset-2 hover:underline"
            >
              {request.pet.name}
            </Link>{' '}
            · {formatRelativeDate(request.createdAt)}
          </p>
        </div>
        <RequestStatusStamp status={request.status} />
      </div>

      <p
        className={
          isExpanded
            ? 'rounded-md border border-hairline bg-paper px-3 py-2 text-sm text-ink'
            : 'line-clamp-4 rounded-md border border-hairline bg-paper px-3 py-2 text-sm text-ink'
        }
      >
        {request.message}
      </p>
      {isLongMessage ? (
        <button
          type="button"
          onClick={() => setIsExpanded((value) => !value)}
          className="self-start text-xs font-medium text-pine outline-none hover:underline focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      ) : null}

      {request.contact ? <ContactBlock contact={request.contact} /> : null}

      {isPending ? (
        <div className="flex gap-2">
          {direction === 'received' ? (
            <>
              <Button size="sm" onClick={() => setIsAcceptOpen(true)}>
                Accept
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsDeclineOpen(true)}
              >
                Decline
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsWithdrawOpen(true)}
            >
              Withdraw request
            </Button>
          )}
        </div>
      ) : null}

      {direction === 'received' ? (
        <>
          <AcceptConfirmDialog
            isOpen={isAcceptOpen}
            onOpenChange={setIsAcceptOpen}
            petName={request.pet.name}
            isConfirming={respond.isPending}
            onConfirm={(reservePet) => {
              respond.mutate(
                { status: 'accepted', reservePet },
                { onSuccess: () => setIsAcceptOpen(false) },
              )
            }}
          />
          <ConfirmDialog
            isOpen={isDeclineOpen}
            onOpenChange={setIsDeclineOpen}
            title="Decline request"
            description={`Decline ${request.adopter.name}'s request to adopt ${request.pet.name}?`}
            confirmLabel="Decline request"
            isDestructive
            isConfirming={respond.isPending}
            onConfirm={() => {
              respond.mutate(
                { status: 'declined', reservePet: false },
                { onSuccess: () => setIsDeclineOpen(false) },
              )
            }}
          />
        </>
      ) : (
        <ConfirmDialog
          isOpen={isWithdrawOpen}
          onOpenChange={setIsWithdrawOpen}
          title="Withdraw request"
          description={`Withdraw your request to adopt ${request.pet.name}? You can't undo this.`}
          confirmLabel="Withdraw request"
          isDestructive
          isConfirming={withdraw.isPending}
          onConfirm={() => {
            withdraw.mutate(request.id, {
              onSuccess: () => setIsWithdrawOpen(false),
            })
          }}
        />
      )}
    </div>
  )
}
