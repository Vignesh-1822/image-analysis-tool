import { Skeleton } from '@/components/ui/skeleton'

export function SKUResultsSkeleton() {
  return (
    <div className="grid grid-cols-5 gap-8 items-start">
      {/* Left panel — image + metadata */}
      <div className="col-span-2 flex flex-col gap-4">
        {/* Image */}
        <Skeleton className="w-full h-72 rounded-xl" />

        {/* Metadata card */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 flex flex-col gap-3">
          <Skeleton className="h-3 w-24" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>

        {/* Button */}
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>

      {/* Right panel — tabs + score cards */}
      <div className="col-span-3 flex flex-col gap-4">
        {/* Tab bar */}
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>

        {/* Score ring + stat badges row */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 flex items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>

        {/* Two metric cards */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 flex flex-col gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>

        {/* Quality metrics */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 flex flex-col gap-3">
          <Skeleton className="h-3 w-32" />
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2 flex-1 rounded-full" />
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>

        {/* Verdict banner */}
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  )
}
