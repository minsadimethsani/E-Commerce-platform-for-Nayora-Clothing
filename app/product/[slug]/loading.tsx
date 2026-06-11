import ProductCardSkeleton from "@/components/ProductCardSkeleton";

export default function ProductLoading() {
  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen">
      
      {/* Product Details Skeleton */}
      <section className="container mx-auto px-4 md:px-8 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Image Gallery Skeleton */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-espresso/5 animate-pulse">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
            {/* Thumbnails Placeholder */}
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((thumb) => (
                <div key={thumb} className="relative aspect-[3/4] bg-espresso/10 animate-pulse" />
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="flex flex-col justify-start">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-2 bg-espresso/10 animate-pulse" />
              <span className="text-espresso/20">/</span>
              <div className="w-16 h-2 bg-espresso/10 animate-pulse" />
              <span className="text-espresso/20">/</span>
              <div className="w-24 h-2 bg-espresso/10 animate-pulse" />
            </div>

            {/* Title & Price */}
            <div className="w-3/4 h-12 bg-espresso/10 animate-pulse mb-4" />
            <div className="w-24 h-6 bg-espresso/10 animate-pulse mb-8" />

            {/* Description */}
            <div className="space-y-2 mb-10">
              <div className="w-full h-4 bg-espresso/10 animate-pulse" />
              <div className="w-full h-4 bg-espresso/10 animate-pulse" />
              <div className="w-4/5 h-4 bg-espresso/10 animate-pulse" />
            </div>

            {/* Color Selection Skeleton */}
            <div className="mb-8">
              <div className="w-16 h-3 bg-espresso/10 animate-pulse mb-4" />
              <div className="flex items-center gap-4">
                {[1, 2, 3].map(c => <div key={c} className="w-8 h-8 rounded-full bg-espresso/10 animate-pulse" />)}
              </div>
            </div>

            {/* Size Selection Skeleton */}
            <div className="mb-12">
              <div className="flex justify-between items-end mb-4">
                <div className="w-12 h-3 bg-espresso/10 animate-pulse" />
                <div className="w-20 h-3 bg-espresso/10 animate-pulse" />
              </div>
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((size) => (
                  <div key={size} className="py-6 bg-espresso/5 animate-pulse border border-espresso/10" />
                ))}
              </div>
            </div>

            {/* Actions Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <div className="w-full sm:w-1/2 py-8 bg-espresso/5 animate-pulse border border-espresso/10" />
              <div className="w-full sm:w-1/2 py-8 bg-espresso/10 animate-pulse" />
            </div>

            {/* Details Accordion Skeleton */}
            <div className="border-t border-espresso/20 pt-6 space-y-6">
              {[1, 2, 3].map(item => (
                <div key={item}>
                  <div className="w-32 h-3 bg-espresso/10 animate-pulse mb-3" />
                  <div className="w-full h-4 bg-espresso/5 animate-pulse" />
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* You Might Also Like Skeleton */}
      <section className="bg-espresso/5 py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-16 border-b border-espresso/10 pb-6">
            <div className="w-64 h-8 bg-espresso/10 animate-pulse" />
            <div className="w-24 h-3 bg-espresso/10 animate-pulse" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
            {[1, 2, 3, 4].map(related => (
              <ProductCardSkeleton key={related} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
