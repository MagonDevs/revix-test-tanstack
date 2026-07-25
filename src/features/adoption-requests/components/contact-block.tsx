import { MonoLabel } from '~/shared/ui/mono-label'

import type { AdoptionRequestContact } from '../model/adoption-request.model'

export interface ContactBlockProps {
  contact: AdoptionRequestContact
}

/** Shown only when `contact` is non-null on the DTO — i.e. only to the two
 * parties on an accepted request, per doc03 §2.7. */
export function ContactBlock({ contact }: ContactBlockProps) {
  return (
    <div className="rounded-md border border-hairline bg-paper px-3 py-2">
      <MonoLabel>Contact</MonoLabel>
      <p className="mt-1 text-sm text-ink">
        {contact.email}
        {contact.phone ? ` · ${contact.phone}` : ''}
      </p>
    </div>
  )
}
