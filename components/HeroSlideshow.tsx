"use client";

import Image from "next/image";
import { Product } from "@/data/cloths";

interface HeroSlideshowProps {
  products: Product[];
}

export default function HeroSlideshow({ products }: HeroSlideshowProps) {
  // Filter products to find ones with images, showcasing exactly the first 4 products
  const slides = products
    .filter((p) => p.image)
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      name: p.name,
      image: p.image!,
    }));

  if (slides.length === 0) {
    return (
      <div className="relative w-full h-[50vh] md:h-[65vh] bg-[#1e1713] flex items-center justify-center">
        <div className="text-center text-cream px-6">
          <h1 className="text-4xl font-serif mb-4">Nayora Clothing</h1>
          <p className="text-lg font-light tracking-wide">Loading our latest collection...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative w-full bg-cream py-6 md:py-10 px-4 md:px-8 overflow-hidden select-none">
      {/* 4-column Grid layout (Responsive: 1 col on mobile, 2 on tablet, 4 on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 h-[50vh] sm:h-[55vh] lg:h-[68vh]">
        {slides.map((slide, index) => {
          const visibilityClass = 
            index === 0 
              ? "" 
              : index === 1 
                ? "hidden sm:block" 
                : "hidden lg:block";

          return (
            <div
              key={slide.id}
              className={`${visibilityClass} relative w-full h-full overflow-hidden rounded-xl md:rounded-2xl shadow-sm bg-[#1e1713]/5`}
            >
              <div className="w-full h-full relative">
                <Image
                  src={slide.image}
                  alt={slide.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center w-full h-full"
                  priority
                />

                {/* Overlays for Index 0 (visible on mobile and tablet, hidden on desktop) */}
                {index === 0 && (
                  <>
                    <div className="absolute inset-0 bg-black/15 z-10 lg:hidden" />
                    <div className="absolute top-8 left-8 z-20 text-white flex flex-col pointer-events-none drop-shadow-md lg:hidden">
                      <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] font-bold text-[#FAF9F6]/90">
                        Redefining
                      </span>
                      <h2 className="font-serif italic text-4xl md:text-5xl lg:text-6xl text-white mt-1 leading-none font-light">
                        Modernity
                      </h2>
                    </div>
                  </>
                )}

                {/* Overlays for Index 2 (hidden on mobile and tablet, visible on desktop) */}
                {index === 2 && (
                  <>
                    <div className="absolute inset-0 bg-black/15 z-10 hidden lg:block" />
                    <div className="absolute top-8 left-8 z-20 text-white flex flex-col pointer-events-none drop-shadow-md hidden lg:flex">
                      <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] font-bold text-[#FAF9F6]/90">
                        Redefining
                      </span>
                      <h2 className="font-serif italic text-4xl md:text-5xl lg:text-6xl text-white mt-1 leading-none font-light">
                        Modernity
                      </h2>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
