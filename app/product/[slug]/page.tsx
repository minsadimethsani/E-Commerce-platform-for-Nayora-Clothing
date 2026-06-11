import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getProductById, getProductsByCategory } from "@/lib/products";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Fetch product from backend helper
  const product = await getProductById(slug);

  if (!product) {
    notFound();
  }

  // Fetch related products using backend helper
  const categoryProducts = await getProductsByCategory(product.category);
  const relatedProducts = categoryProducts
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen">
      
      {/* Product Details Section */}
      <section className="container mx-auto px-4 md:px-8 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-espresso/5">
              <Image 
                src={product.image} 
                alt={product.name} 
                fill 
                className="object-cover"
                priority
              />
              {product.tag && (
                <div className="absolute top-6 left-6 bg-espresso text-cream text-[10px] uppercase tracking-widest font-bold px-4 py-2">
                  {product.tag}
                </div>
              )}
            </div>
            {/* Thumbnails Placeholder */}
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((thumb) => (
                <div key={thumb} className="relative aspect-[3/4] overflow-hidden bg-espresso/5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                  <Image src={product.image} alt={`${product.name} thumbnail ${thumb}`} fill className="object-cover" />
                </div>
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
            <span className="text-2xl text-espresso/90 mb-8 font-light">${product.price}</span>

            <p className="text-espresso/70 text-base leading-relaxed mb-10">
              A masterclass in modern tailoring. This {product.name.toLowerCase()} is crafted from the finest sustainable materials, offering an uncompromising blend of comfort, utility, and timeless style. Designed to be a staple in your wardrobe for years to come.
            </p>

            {/* Color Selection */}
            {product.color && (
              <div className="mb-8">
                <span className="block text-xs uppercase tracking-widest font-bold mb-4">Color: {product.color}</span>
                <div className="flex items-center gap-4">
                  <button className="w-8 h-8 rounded-full bg-espresso border border-espresso/20 hover:scale-110 transition-transform"></button>
                  <button className="w-8 h-8 rounded-full bg-[#9F8170] border border-espresso/20 hover:scale-110 transition-transform"></button>
                  <button className="w-8 h-8 rounded-full bg-cream border border-espresso/20 hover:scale-110 transition-transform"></button>
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div className="mb-12">
              <div className="flex justify-between items-end mb-4">
                <span className="text-xs uppercase tracking-widest font-bold">Size</span>
                <button className="text-[10px] uppercase tracking-widest font-bold text-espresso/50 hover:text-espresso underline underline-offset-4">Size Guide</button>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                  <button key={size} className="py-3 border border-espresso/20 hover:border-espresso hover:bg-espresso/5 transition-all text-sm font-medium">
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 mb-16">
              <button className="w-full py-5 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors shadow-xl">
                Add to Bag
              </button>
              <button className="w-full py-5 border border-espresso/20 text-espresso text-sm uppercase tracking-widest font-bold hover:bg-espresso/5 transition-colors">
                Add to Wishlist
              </button>
            </div>

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
                <p className="text-sm text-espresso/70 leading-relaxed">Complimentary shipping on orders over $200. Returns accepted within 30 days.</p>
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
