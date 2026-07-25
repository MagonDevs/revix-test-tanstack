import type { PetStatus } from '~/contracts'

export interface StatusAction {
  targetStatus: PetStatus
  label: string
}

export function getLegalStatusActions(current: PetStatus): StatusAction[] {
  switch (current) {
    case 'available':
      return [
        { targetStatus: 'reserved', label: 'Mark as reserved' },
        { targetStatus: 'adopted', label: 'Mark as adopted' },
        { targetStatus: 'withdrawn', label: 'Withdraw listing' },
      ]
    case 'reserved':
      return [
        { targetStatus: 'available', label: 'Mark as available' },
        { targetStatus: 'adopted', label: 'Mark as adopted' },
        { targetStatus: 'withdrawn', label: 'Withdraw listing' },
      ]
    case 'adopted':
      return [{ targetStatus: 'withdrawn', label: 'Withdraw listing' }]
    case 'withdrawn':
      return []
    default:
      return []
  }
}
