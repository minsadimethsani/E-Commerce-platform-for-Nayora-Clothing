"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Product } from "@/data/cloths";

interface HeroSlideshowProps {
  products: Product[];
}

export default function HeroSlideshow({ products }: HeroSlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || slides.length <= 1) return;
    if (typeof window !== "undefined" && (window.matchMedia("(hover: none)").matches || window.innerWidth < 768)) {
      return;
    }
    const { left, width } = containerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const pct = Math.max(0, Math.min(0.999, x / width));
    const targetIndex = Math.floor(pct * slides.length);
    if (targetIndex !== activeIndex) {
      setActiveIndex(targetIndex);
    }
  };

  // Filter products to find ones with images, showcasing up to 5 live products
  const slides = products
    .filter((p) => p.image)
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      image: p.image!,
      price: p.price,
    }));

  // Setup autoplay loop with pause on hover behavior
  useEffect(() => {
    if (slides.length <= 1) return;

    if (!isHovered) {
      autoplayTimerRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % slides.length);
      }, 2000);
    }

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [slides.length, isHovered]);

  if (slides.length === 0) {
    // Fallback if no products are loaded yet
    return (
      <div className="relative w-full h-[60vh] lg:h-[75vh] overflow-hidden rounded-t-[10rem] rounded-b-[2rem] shadow-2xl bg-[#EAE5DF] flex items-center justify-center">
        <Image
          src="/hero-v2.png"
          alt="Nayora Editorial Collection"
          fill
          className="object-cover object-center"
          priority
        />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[60vh] lg:h-[75vh] overflow-hidden rounded-t-[10rem] rounded-b-[2rem] shadow-2xl group"
      onMouseEnter={() => {
        if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches && window.innerWidth >= 768) {
          setIsHovered(true);
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides Container */}
      <div className="w-full h-full relative bg-[#EAE5DF]">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Blurred Background Layer to fill the frame with matching tones */}
              <Image
                src={slide.image}
                alt=""
                fill
                sizes="10vw"
                className="object-cover object-center blur-2xl opacity-25 scale-110 select-none pointer-events-none transition-transform duration-[6s] ease-out group-hover:scale-115"
              />
              
              {/* Sharp contained foreground layer to show the full uncropped image */}
              <Image
                src={slide.image}
                alt={slide.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`object-contain object-center ${
                  isActive ? "animate-[heroZoom_2500ms_ease-out_forwards]" : "scale-100"
                }`}
                priority={index === 0}
              />
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes heroZoom {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.35);
          }
        }
      `}</style>
    </div>
  );
}
