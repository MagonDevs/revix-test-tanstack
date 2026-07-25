import { Link } from '@tanstack/react-router'
import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'

import { ConfirmDialog } from '~/shared/components/confirm-dialog'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '~/shared/ui/dropdown-menu'
import { MonoLabel } from '~/shared/ui/mono-label'
import { StatusStamp } from '~/shared/ui/status-stamp'

import { useDeletePet, useUpdatePetStatus } from '../api/pets.mutations'
import { formatAge } from '../utils/pet-age'

import { getLegalStatusActions } from './pet-status-menu-items'

import type { OwnedPetDto, PetStatus } from '~/contracts'

export interface PetListingRowProps {
  pet: OwnedPetDto
}

export function PetListingRow({ pet }: PetListingRowProps) {
  const [pendingStatus, setPendingStatus] = useState<PetStatus | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const updateStatus = useUpdatePetStatus(pet.id)
  const deletePet = useDeletePet()

  const actions = getLegalStatusActions(pet.status)
  const cover = pet.photos[0]

  function confirmStatusChange() {
    if (!pendingStatus) return
    updateStatus.mutate(
      { status: pendingStatus, declinePendingRequests: true },
      { onSettled: () => setPendingStatus(null) },
    )
  }

  function confirmDelete() {
    deletePet.mutate(pet.id, { onSettled: () => setIsDeleteOpen(false) })
  }

  const statusDialogCopy =
    pendingStatus === 'adopted'
      ? {
          title: 'Mark as adopted',
          description:
            pet.pendingRequestCount > 0
              ? `${pet.pendingRequestCount} pending request${pet.pendingRequestCount === 1 ? '' : 's'} will be declined.`
              : 'This listing will be marked as adopted.',
        }
      : pendingStatus === 'withdrawn'
        ? {
            title: 'Withdraw listing',
            description:
              pet.pendingRequestCount > 0
                ? `${pet.pendingRequestCount} pending request${pet.pendingRequestCount === 1 ? '' : 's'} will be declined.`
                : 'This listing will no longer be visible to adopters.',
          }
        : {
            title: 'Change status',
            description: `${pet.name}'s status will change.`,
          }

  return (
    <div className="flex flex-col gap-3 border-b border-hairline py-3 last:border-b-0 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex items-center gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-hairline bg-surface">
          {cover ? (
            <img src={cover.url} alt="" className="size-full object-cover" />
          ) : (
            <MonoLabel>No photo</MonoLabel>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink">{pet.name}</p>
          <MonoLabel>
            {pet.species} · {formatAge(pet.ageMonths)} · {pet.size}
          </MonoLabel>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:ml-auto">
        <StatusStamp status={pet.status} />
        {/* Plain <a>, not a typed <Link>: /dashboard/requests/received has no
            `petId` search param until Phase 6 wires it up — this only needs
            to point at the right place today. */}
        <a
          href={`/dashboard/requests/received?petId=${pet.id}`}
          className="text-sm text-mute underline-offset-4 hover:text-ink hover:underline"
        >
          {pet.pendingRequestCount} pending request
          {pet.pendingRequestCount === 1 ? '' : 's'}
        </a>

        <DropdownMenuRoot>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Row actions"
              className="flex size-9 shrink-0 items-center justify-center rounded-md text-mute outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2"
            >
              <MoreHorizontal className="size-4" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/dashboard/pets/$petId/edit" params={{ petId: pet.id }}>
                Edit
              </Link>
            </DropdownMenuItem>
            {actions.map((action) => (
              <DropdownMenuItem
                key={action.targetStatus}
                onSelect={() => setPendingStatus(action.targetStatus)}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              isDestructive
              onSelect={() => setIsDeleteOpen(true)}
            >
              Delete listing
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuRoot>
      </div>

      <ConfirmDialog
        isOpen={pendingStatus !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPendingStatus(null)
        }}
        title={statusDialogCopy.title}
        description={statusDialogCopy.description}
        confirmLabel={statusDialogCopy.title}
        isDestructive={pendingStatus === 'withdrawn'}
        isConfirming={updateStatus.isPending}
        onConfirm={confirmStatusChange}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete listing"
        description={`Deleting ${pet.name}'s listing is permanent and can't be undone.`}
        confirmLabel="Delete listing"
        isDestructive
        isConfirming={deletePet.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
