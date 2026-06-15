import ProductCardSkeleton from "@/components/ProductCardSkeleton";

export default function CategoryLoading() {
  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen">
      {/* Skeleton Header */}
      <section className="pt-32 pb-20 px-6 text-center border-b border-espresso/10 bg-espresso/5">
        <div className="w-48 h-10 bg-espresso/10 animate-pulse mx-auto mb-6"></div>
        <div className="w-3/4 max-w-xl h-4 bg-espresso/10 animate-pulse mx-auto mb-2"></div>
        <div className="w-1/2 max-w-md h-4 bg-espresso/10 animate-pulse mx-auto"></div>
      </section>

      <section className="container mx-auto px-4 md:px-8 py-16">
        <div className="flex justify-between items-center mb-12 border-b border-espresso/10 pb-6">
          <div className="w-24 h-4 bg-espresso/10 animate-pulse"></div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-3 bg-espresso/10 animate-pulse"></div>
            <div className="w-32 h-6 bg-espresso/10 animate-pulse"></div>
          </div>
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
