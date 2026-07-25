import { useState } from 'react'

import { cn } from '~/shared/lib/cn'
import { MonoLabel } from '~/shared/ui/mono-label'

import type { PetDto } from '~/contracts'

export function PetGallery({
  photos,
  name,
}: {
  photos: PetDto['photos']
  name: string
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = photos[activeIndex]

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-hairline bg-surface">
        <MonoLabel>No photo</MonoLabel>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="aspect-[4/3] overflow-hidden rounded-lg border border-hairline bg-surface">
        <img
          src={active?.url}
          alt={active?.alt ?? name}
          className="size-full object-cover"
        />
      </div>
      {photos.length > 1 ? (
        <div role="tablist" aria-label="Photos" className="flex gap-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Photo ${index + 1} of ${photos.length}`}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight')
                  setActiveIndex((i) => Math.min(i + 1, photos.length - 1))
                if (e.key === 'ArrowLeft')
                  setActiveIndex((i) => Math.max(i - 1, 0))
              }}
              className={cn(
                'size-16 shrink-0 overflow-hidden rounded-md border outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2',
                index === activeIndex ? 'border-pine' : 'border-hairline',
              )}
            >
              <img src={photo.url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
