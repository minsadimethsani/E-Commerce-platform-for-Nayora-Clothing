import Image from "next/image";
import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import PreOrderButton from "@/components/PreOrderButton";

export default async function NewArrivals() {
  const allProducts = await getAllProducts();
  const newProducts = allProducts.filter(p => p.tag).slice(0, 4);

  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen">
      
      {/* Editorial Header */}
      <section className="relative w-full pt-6 md:pt-16 pb-24 px-6 text-center border-b border-espresso/10 bg-gradient-to-b from-espresso/5 to-cream">
        <span className="text-espresso uppercase tracking-[0.3em] text-xs font-bold mb-6 block drop-shadow-sm">
          Volume 01
        </span>
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 text-espresso tracking-tight">
          New Arrivals
        </h1>
        <p className="text-lg md:text-xl text-espresso/70 max-w-2xl mx-auto font-light leading-relaxed">
          The latest expressions of modern luxury. Discover pieces defined by exceptional tailoring and uncompromising materials.
        </p>
      </section>

      {/* Featured Campaign - High Conversion Section */}
      <section className="container mx-auto px-4 md:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-espresso/5">
            <Image 
              src="/hero.png" 
              alt="The Signature Overcoat Campaign" 
              fill 
              className="object-cover hover:scale-105 transition-transform duration-[2s] ease-out" 
              priority
            />
            <div className="absolute top-6 left-6 bg-espresso text-cream text-[10px] uppercase tracking-widest font-bold px-4 py-2">
              Campaign Exclusive
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 leading-tight">The Signature Overcoat</h2>
            <p className="text-espresso/70 text-lg mb-10 leading-relaxed font-light">
              Crafted from 100% recycled cashmere. This limited-edition overcoat combines timeless structure with an undeniably soft drape. Only 50 pieces produced globally.
            </p>
            <div className="flex items-center gap-6 mb-12">
              <span className="text-2xl font-medium">$850</span>
              <span className="text-sm uppercase tracking-widest text-espresso/50 font-bold">Low Stock</span>
            </div>
            <PreOrderButton />
          </div>
        </div>
      </section>

      {/* Lookbook Grid */}
      <section className="bg-espresso/5 py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-16 border-b border-espresso/10 pb-6">
            <h3 className="text-2xl md:text-3xl font-serif font-bold">The Latest Drop</h3>
            <Link href="/collections" className="text-[10px] font-bold uppercase tracking-[0.2em] text-espresso/60 hover:text-espresso transition-colors">
              Shop All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Hook */}
      <section className="py-32 px-6 text-center max-w-3xl mx-auto">
        <h3 className="text-3xl md:text-4xl font-serif font-bold mb-6">Never Miss a Release</h3>
        <p className="text-espresso/70 mb-10 font-light text-lg">
          Our limited-run collections sell out quickly. Join our private newsletter to receive 24-hour early access to all new arrivals.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <input 
            type="email" 
            placeholder="Enter your email address" 
            className="px-6 py-4 bg-transparent border border-espresso/30 text-espresso placeholder:text-espresso/40 focus:outline-none focus:border-espresso min-w-[300px]"
          />
          <button className="px-8 py-4 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors">
            Gain Access
          </button>
        </div>
      </section>
    </div>
  );
}
