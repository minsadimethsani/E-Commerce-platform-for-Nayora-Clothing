export default function CuratedCategoriesSkeleton() {
  return (
    <section className="py-12 px-6 md:px-12 container mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div className="w-64 h-10 bg-espresso/10 animate-pulse rounded"></div>
        <div className="w-20 h-5 bg-espresso/10 animate-pulse hidden sm:block rounded"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col block">
            <div className="relative aspect-[3/4] overflow-hidden mb-6 bg-espresso/5 animate-pulse">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
            <div className="w-3/4 h-7 bg-espresso/10 animate-pulse mb-3 rounded"></div>
            <div className="w-24 h-4 bg-espresso/10 animate-pulse rounded"></div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 flex justify-center sm:hidden">
        <div className="w-40 h-5 bg-espresso/10 animate-pulse rounded"></div>
      </div>
    </section>
  );
}
