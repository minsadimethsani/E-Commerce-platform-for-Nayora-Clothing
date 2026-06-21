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
      <div className="relative w-full h-[60vh] md:h-[75vh] bg-[#1e1713] flex items-center justify-center">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 h-[60vh] sm:h-[65vh] lg:h-[78vh]">
        {slides.map((slide, index) => {
          // Check if this slide is the 3rd one (index 2) to display "Redefining Modernity"
          const isFeatured = index === 2;

          return (
            <div
              key={slide.id}
              className="relative w-full h-full overflow-hidden rounded-xl md:rounded-2xl shadow-sm bg-[#1e1713]/5"
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

                {/* Subtly dim only the featured image to make the title overlay highly readable */}
                {isFeatured && (
                  <div className="absolute inset-0 bg-black/15 z-10" />
                )}

                {/* Editorial Text Overlay - "Redefining Modernity" on 3rd slide */}
                {isFeatured && (
                  <div className="absolute top-8 left-8 z-20 text-white flex flex-col pointer-events-none drop-shadow-md">
                    <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] font-bold text-[#FAF9F6]/90">
                      Redefining
                    </span>
                    <h2 className="font-serif italic text-4xl md:text-5xl lg:text-6xl text-white mt-1 leading-none font-light">
                      Modernity
                    </h2>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
