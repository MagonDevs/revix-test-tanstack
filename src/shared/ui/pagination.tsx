import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '~/shared/lib/cn'

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

function getPageRange(
  page: number,
  totalPages: number,
): (number | 'ellipsis')[] {
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1])
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b)

  const result: (number | 'ellipsis')[] = []
  let previous = 0
  for (const p of sorted) {
    if (previous && p - previous > 1) result.push('ellipsis')
    result.push(p)
    previous = p
  }
  return result
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = getPageRange(page, totalPages)

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="flex size-9 items-center justify-center rounded-md border border-hairline text-mute outline-none transition-colors hover:border-ink/40 focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span
            key={`ellipsis-${i}`}
            className="px-1.5 font-mono text-xs text-mute"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'flex size-9 items-center justify-center rounded-md font-mono text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2',
              p === page
                ? 'border border-pine bg-pine-tint text-pine'
                : 'border border-hairline text-mute hover:border-ink/40',
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="flex size-9 items-center justify-center rounded-md border border-hairline text-mute outline-none transition-colors hover:border-ink/40 focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  )
}
