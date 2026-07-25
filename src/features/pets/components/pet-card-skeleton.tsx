import { Skeleton } from '~/shared/ui/skeleton'

export function PetCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton variant="card" className="aspect-[4/3] h-auto" />
      <Skeleton variant="text" className="w-2/3" />
      <Skeleton variant="text" className="w-1/2" />
    </div>
  )
}
