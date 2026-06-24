import Image from "next/image";
import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import PreOrderButton from "@/components/PreOrderButton";

export default async function NewArrivals() {
  const allProducts = await getAllProducts();

  // Sort products by creation date descending
  const sortedProducts = [...allProducts].sort((a, b) => {
    const aTime = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
    const bTime = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
    return bTime - aTime;
  });

  // Display the top 12 recently added products
  const newProducts = sortedProducts.slice(0, 12);

  const firstProduct = newProducts[0];
  const secondProduct = newProducts[1];
  const remainingProducts = newProducts.slice(2);

  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen">

      {/* Editorial Header */}
      <section className="relative w-full pt-6 md:pt-16 pb-24 px-6 text-center border-b border-espresso/10 bg-gradient-to-b from-espresso/5 to-cream">
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 text-espresso tracking-tight">
          New Arrivals
        </h1>
        <p className="text-lg md:text-xl text-espresso/70 max-w-2xl mx-auto font-light leading-relaxed">
          The latest expressions of modern luxury. Discover pieces defined by exceptional tailoring and uncompromising materials.
        </p>
      </section>

      {/* First Featured Campaign - Image Left, Content Right */}
      {firstProduct && (
        <section className="container mx-auto px-4 md:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
            <div className="lg:col-span-4 relative aspect-[4/5] w-full overflow-hidden bg-espresso/5">
              <Image
                src={firstProduct.image || "/hero.png"}
                alt={firstProduct.name}
                fill
                className="object-cover hover:scale-105 transition-transform duration-[2s] ease-out"
                priority
              />
              {firstProduct.tag && (
                <div className="absolute top-6 left-6 bg-espresso text-cream text-[10px] uppercase tracking-widest font-bold px-4 py-2">
                  {firstProduct.tag}
                </div>
              )}
            </div>
            <div className="lg:col-span-7 flex flex-col justify-center">
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 leading-tight">{firstProduct.name}</h2>
              <p className="text-espresso/70 text-lg mb-10 leading-relaxed font-light">
                {(firstProduct as any).description || "Discover the latest expression of modern luxury, defined by exceptional tailoring and uncompromising materials."}
              </p>
              <div className="flex items-center gap-6 mb-12">
                <span className="text-2xl font-medium">LKR {firstProduct.price}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${(firstProduct as any).quantity > 10 ? 'bg-green-100 text-green-800' :
                  (firstProduct as any).quantity > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                  {(firstProduct as any).quantity > 10 ? 'In Stock' : (firstProduct as any).quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                </span>
              </div>
              <Link
                href={`/product/${firstProduct.id}`}
                className="px-8 py-4 bg-espresso text-cream text-center text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors shadow-md"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Second Featured Campaign - Content Left, Image Right */}
      {secondProduct && (
        <section className="container mx-auto px-4 md:px-8 py-20 border-t border-espresso/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
            <div className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-1">
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 leading-tight">{secondProduct.name}</h2>
              <p className="text-espresso/70 text-lg mb-10 leading-relaxed font-light">
                {(secondProduct as any).description || "Discover the latest expression of modern luxury, defined by exceptional tailoring and uncompromising materials."}
              </p>
              <div className="flex items-center gap-6 mb-12">
                <span className="text-2xl font-medium">LKR {secondProduct.price}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${(secondProduct as any).quantity > 10 ? 'bg-green-100 text-green-800' :
                  (secondProduct as any).quantity > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                  {(secondProduct as any).quantity > 10 ? 'In Stock' : (secondProduct as any).quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                </span>
              </div>
              <Link
                href={`/product/${secondProduct.id}`}
                className="px-8 py-4 bg-espresso text-cream text-center text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors shadow-md"
              >
                Shop Now
              </Link>
            </div>
            <div className="lg:col-span-4 relative aspect-[4/5] w-full overflow-hidden bg-espresso/5 order-1 lg:order-2">
              <Image
                src={secondProduct.image || "/hero.png"}
                alt={secondProduct.name}
                fill
                className="object-cover hover:scale-105 transition-transform duration-[2s] ease-out"
              />
              {secondProduct.tag && (
                <div className="absolute top-6 left-6 bg-espresso text-cream text-[10px] uppercase tracking-widest font-bold px-4 py-2">
                  {secondProduct.tag}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Lookbook Grid */}
      {remainingProducts.length > 0 && (
        <section className="bg-espresso/5 py-24">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex justify-between items-end mb-16 border-b border-espresso/10 pb-6">
              <h3 className="text-2xl md:text-3xl font-serif font-bold">More New Arrivals</h3>
              <Link href="/collections" className="text-[10px] font-bold uppercase tracking-[0.2em] text-espresso/60 hover:text-espresso transition-colors">
                Shop All
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
              {remainingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

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

