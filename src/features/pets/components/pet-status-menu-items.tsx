import type { PetStatus } from '~/contracts'

export interface StatusAction {
  targetStatus: PetStatus
  label: string
}

/**
 * Legal next-states per doc03 §3.4: available<->reserved, available|reserved
 * -> adopted, any -> withdrawn. Purely a UI-side computation so we don't
 * render an action that would 409 — the server remains the enforcement
 * authority.
 */
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
      // Doc03 §3.4 only documents "any -> withdrawn" as a legal transition;
      // withdrawn has no legal forward transition, so no actions render.
      return []
    default:
      return []
  }
}
