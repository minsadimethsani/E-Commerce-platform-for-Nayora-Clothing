import Link from "next/link";
import { getProductsByCategory } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default async function ProductNotFound() {
  // We can show some top selling/featured products since we don't have the current product
  // Let's just fetch all and take the first 4 as "recommended"
  const { getAllProducts } = await import("@/lib/products");
  const allProducts = await getAllProducts();
  const recommendedProducts = allProducts.slice(0, 4);

  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen">
      
      {/* 404 Hero Section */}
      <section className="pt-32 pb-24 px-6 text-center border-b border-espresso/10 bg-gradient-to-b from-espresso/5 to-cream">
        <span className="text-espresso uppercase tracking-[0.3em] text-xs font-bold mb-6 block drop-shadow-sm">
          Item Unavailable
        </span>
        <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-espresso tracking-tight">
          Product Not Found
        </h1>
        <p className="text-lg md:text-xl text-espresso/70 max-w-2xl mx-auto font-light leading-relaxed mb-10">
          The item you are looking for may be out of stock, part of a limited-edition run that has ended, or has been removed from our catalog.
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            href="/new-arrivals" 
            className="px-8 py-4 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors shadow-lg"
          >
            Shop New Arrivals
          </Link>
        </div>
      </section>

      {/* Suggested Products Section */}
      <section className="bg-espresso/5 py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-16 border-b border-espresso/10 pb-6">
            <h3 className="text-2xl md:text-3xl font-serif font-bold">Discover Other Pieces</h3>
            <Link href="/collections" className="text-[10px] font-bold uppercase tracking-[0.2em] text-espresso/60 hover:text-espresso transition-colors">
              View All Collections
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      
    </div>
  );
}
