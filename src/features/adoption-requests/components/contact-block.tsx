import { MonoLabel } from '~/shared/ui/mono-label'

import type { AdoptionRequestContact } from '../model/adoption-request.model'

export interface ContactBlockProps {
  contact: AdoptionRequestContact
}

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
