export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      {/* Image Skeleton */}
      <div className="relative aspect-[3/4] w-full mb-5 bg-espresso/10 animate-pulse overflow-hidden">
        {/* Optional shimmering effect line */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
      
      {/* Text Skeleton */}
      <div className="flex flex-col items-center">
        <div className="h-2 w-16 bg-espresso/10 animate-pulse mb-3 rounded-full" />
        <div className="h-4 w-40 bg-espresso/10 animate-pulse mb-3 rounded-full" />
        <div className="h-3 w-12 bg-espresso/10 animate-pulse rounded-full" />
      </div>
    </div>
  );
}
