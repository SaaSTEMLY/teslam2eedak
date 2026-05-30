import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <main id="main-content" className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-14 w-64" />
        <Skeleton className="mt-4 h-6 w-96" />

        {/* Filters skeleton */}
        <div className="mt-8 flex gap-3">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>

        {/* Product grid skeleton */}
        <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="mt-2 h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
