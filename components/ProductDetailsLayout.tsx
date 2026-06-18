"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ProductActions from "@/components/ProductActions";
import { Product } from "@/data/cloths";

interface ProductDetailsLayoutProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailsLayout({ product, relatedProducts }: ProductDetailsLayoutProps) {
  const [activeImage, setActiveImage] = useState(product.image || "/hero.png");
  const [selectedColor, setSelectedColor] = useState<string>("");

  const containerRef = useRef<HTMLDivElement>(null);
  const zoomWrapperRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (typeof window !== "undefined" && (window.matchMedia("(hover: none)").matches || window.innerWidth < 768)) {
      return;
    }
    if (!zoomWrapperRef.current) return;
    zoomWrapperRef.current.style.transition = "transform 0.3s ease-out";
    zoomWrapperRef.current.style.transform = "scale(2)";
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== "undefined" && (window.matchMedia("(hover: none)").matches || window.innerWidth < 768)) {
      return;
    }
    if (!containerRef.current || !zoomWrapperRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    zoomWrapperRef.current.style.transition = "none";
    zoomWrapperRef.current.style.transformOrigin = `${x}% ${y}%`;
  };

  const handleMouseLeave = () => {
    if (typeof window !== "undefined" && (window.matchMedia("(hover: none)").matches || window.innerWidth < 768)) {
      return;
    }
    if (!zoomWrapperRef.current) return;
    zoomWrapperRef.current.style.transition = "transform 0.3s ease-out, transform-origin 0.3s ease-out";
    zoomWrapperRef.current.style.transform = "scale(1)";
    zoomWrapperRef.current.style.transformOrigin = "center center";
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (product.colorImages) {
      let matchKey = color;
      if (!product.colorImages[color]) {
        const found = Object.keys(product.colorImages).find(
          key => key.toLowerCase() === color.toLowerCase()
        );
        if (found) matchKey = found;
      }
      
      const imagesForColor = product.colorImages[matchKey];
      if (imagesForColor && imagesForColor.length > 0) {
        setActiveImage(imagesForColor[0]);
      }
    }
  };

  // Determine the list of thumbnails to show based on color selection
  let displayImages: string[] = [];
  if (product.colorImages && selectedColor) {
    const matchKey = Object.keys(product.colorImages).find(
      key => key.toLowerCase() === selectedColor.toLowerCase()
    );
    if (matchKey && product.colorImages[matchKey] && product.colorImages[matchKey].length > 0) {
      displayImages = product.colorImages[matchKey];
    }
  }
  
  if (displayImages.length === 0) {
    displayImages = product.images && product.images.length > 0 ? product.images : [product.image || "/hero.png"];
  }

  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen">
      
      {/* Product Details Section */}
      <section className="container mx-auto px-4 md:px-8 pt-6 md:pt-16 pb-24 md:pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Image Gallery */}
          <div className="flex flex-col gap-4">
            <div 
              ref={containerRef}
              className="relative aspect-[3/4] w-full overflow-hidden bg-espresso/5 border border-espresso/10 cursor-default md:cursor-zoom-in group"
              onMouseEnter={handleMouseEnter}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div 
                ref={zoomWrapperRef}
                className="w-full h-full relative origin-center"
              >
                <Image 
                  src={activeImage} 
                  alt={product.name || "Product"} 
                  fill 
                  className="object-cover"
                  priority
                />
              </div>
              {product.tag && (
                <div className="absolute top-6 left-6 bg-espresso text-cream text-[10px] uppercase tracking-widest font-bold px-4 py-2 z-10 pointer-events-none">
                  {product.tag}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
              {displayImages.map((imgUrl, i) => (
                <button 
                  key={i} 
                  type="button"
                  onClick={() => setActiveImage(imgUrl)}
                  className={`relative aspect-[3/4] overflow-hidden bg-espresso/5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity border-2 rounded ${
                    activeImage === imgUrl ? 'border-espresso opacity-100' : 'border-transparent'
                  }`}
                  title={`View image ${i + 1}`}
                >
                  <Image src={imgUrl} alt={`${product.name} thumbnail ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-start">
            <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-espresso/50 mb-8">
              <Link href="/" className="hover:text-espresso transition-colors">Home</Link>
              <span>/</span>
              <Link href={`/category/${product.category.toLowerCase()}`} className="hover:text-espresso transition-colors">{product.category}</Link>
              <span>/</span>
              <span className="text-espresso">{product.name}</span>
            </nav>

            <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-4">{product.name}</h1>
            <span className="text-2xl text-espresso/90 mb-8 font-light">LKR {product.price}</span>

            <p className="text-espresso/70 text-base leading-relaxed mb-10">
              A masterclass in modern tailoring. This {product.name.toLowerCase()} is crafted from the finest sustainable materials, offering an uncompromising blend of comfort, utility, and timeless style. Designed to be a staple in your wardrobe for years to come.
            </p>

            {/* Size & Actions with color callback */}
            <ProductActions product={product} onColorChange={handleColorChange} />

            {/* Details Accordion */}
            <div className="border-t border-espresso/20 pt-6 space-y-6">
              <div>
                <h4 className="text-xs uppercase tracking-widest font-bold mb-2">Details & Fit</h4>
                <p className="text-sm text-espresso/70 leading-relaxed">Relaxed fit. True to size. Model is 5'10" and wears a size S.</p>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-widest font-bold mb-2">Materials & Care</h4>
                <p className="text-sm text-espresso/70 leading-relaxed">100% Organic Materials. Dry clean only. Store folded.</p>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-widest font-bold mb-2">Shipping & Returns</h4>
                <p className="text-sm text-espresso/70 leading-relaxed">Complimentary shipping on orders over LKR 15,000. Returns accepted within 30 days.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* You Might Also Like */}
      {relatedProducts.length > 0 && (
        <section className="bg-espresso/5 py-24">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex justify-between items-end mb-16 border-b border-espresso/10 pb-6">
              <h3 className="text-2xl md:text-3xl font-serif font-bold">You Might Also Like</h3>
              <Link href={`/category/${product.category}`} className="text-[10px] font-bold uppercase tracking-[0.2em] text-espresso/60 hover:text-espresso transition-colors">
                View Category
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
              {relatedProducts.map(related => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
