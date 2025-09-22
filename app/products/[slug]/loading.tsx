import { Skeleton } from '@/components/ui/skeleton'

export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <Skeleton className="mb-8 h-4 w-96" />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Badges */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          {/* Product Name */}
          <div>
            <Skeleton className="mb-2 h-10 w-3/4" />
            <Skeleton className="h-6 w-full" />
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-5" />
              ))}
            </div>
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-8 rounded-full" />
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-12" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-16 rounded-md" />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-md" />
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1 rounded-md" />
              <Skeleton className="h-10 flex-1 rounded-md" />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4 border-t pt-6">
            <div>
              <Skeleton className="mb-2 h-5 w-24" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            <div>
              <Skeleton className="mb-2 h-5 w-32" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="ml-4 h-4 w-32" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <div className="mb-8 text-center">
          <Skeleton className="mx-auto mb-4 h-8 w-48" />
          <Skeleton className="mx-auto h-5 w-96" />
        </div>

        <div className="flex gap-6 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-72 flex-none">
              <div className="animate-pulse overflow-hidden rounded-lg bg-white">
                <Skeleton className="aspect-square w-full" />
                <div className="space-y-3 p-4">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-5 w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
