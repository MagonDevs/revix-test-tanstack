import { Check, Link2 } from 'lucide-react'

import { useCopyToClipboard } from '~/shared/hooks/use-copy-to-clipboard'
import { cn } from '~/shared/lib/cn'
import { toast } from '~/shared/ui/toast'

export interface ShareLinkButtonProps {
  path: string
  label?: string
  className?: string
}

export function ShareLinkButton({
  path,
  label = 'Copy link',
  className,
}: ShareLinkButtonProps) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface/90 text-ink outline-none transition-colors duration-150 ease-out hover:border-ink/40 focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2',
        className,
      )}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        const url = `${window.location.origin}${path}`
        void copy(url).then(() => toast.success('Link copied'))
      }}
    >
      {copied ? (
        <Check className="size-5 text-pine" aria-hidden />
      ) : (
        <Link2 className="size-5" aria-hidden />
      )}
    </button>
  )
}
