import { Skeleton } from "@/components/ui/skeleton"

export default function RoleDetailsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Card Principal */}
        <div className="md:col-span-2">
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>

        {/* Cards Laterais */}
        <div className="space-y-6">
          <Skeleton className="h-[150px] w-full rounded-lg" />
          <Skeleton className="h-[150px] w-full rounded-lg" />
        </div>
      </div>

      {/* Permissões */}
      <Skeleton className="h-[600px] w-full rounded-lg" />
    </div>
  )
}
