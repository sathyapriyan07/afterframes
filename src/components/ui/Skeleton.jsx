export function Skeleton({ className = '' }) {
  return <div className={`shimmer rounded-xl ${className}`} />
}

export function MovieCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-40 md:w-48">
      <Skeleton className="aspect-[2/3] w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-1" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}

export function PersonCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-32 md:w-40 text-center">
      <Skeleton className="aspect-square w-full rounded-full mb-2" />
      <Skeleton className="h-4 w-3/4 mx-auto mb-1" />
      <Skeleton className="h-3 w-1/2 mx-auto" />
    </div>
  )
}

export function GridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-[2/3] w-full" />
      ))}
    </div>
  )
}
