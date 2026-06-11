import Link from "next/link";
import Image from "next/image";

// Simulated network delay for realistic lazy loading experience
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 1500));

export default async function CuratedCategories() {
  await simulateDelay();

  return (
    <section className="py-12 px-6 md:px-12 container mx-auto">
      <div className="flex justify-between items-end mb-12">
        <h2 className="text-3xl md:text-4xl font-serif text-espresso">Curated Categories</h2>
        <Link href="/collections" className="text-sm font-semibold uppercase tracking-widest border-b border-espresso pb-1 hover:text-olive hover:border-olive transition-colors hidden sm:block">
          View All
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        {/* Category 1 */}
        <Link href="/category/women" className="group flex flex-col block cursor-pointer">
          <div className="relative aspect-[3/4] overflow-hidden mb-6 bg-espresso/5">
            <Image src="/women.png" alt="Women's Collection" fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
          </div>
          <h3 className="text-xl font-serif mb-2">Women's Collection</h3>
          <span className="text-sm text-espresso/70 uppercase tracking-wider group-hover:text-olive transition-colors">Shop Now →</span>
        </Link>
        
        {/* Category 2 */}
        <Link href="/category/men" className="group flex flex-col block cursor-pointer">
          <div className="relative aspect-[3/4] overflow-hidden mb-6 bg-espresso/5">
            <Image src="/men.png" alt="Men's Collection" fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
          </div>
          <h3 className="text-xl font-serif mb-2">Men's Collection</h3>
          <span className="text-sm text-espresso/70 uppercase tracking-wider group-hover:text-olive transition-colors">Shop Now →</span>
        </Link>

        {/* Category 3 */}
        <Link href="/category/accessories" className="group flex flex-col block cursor-pointer">
          <div className="relative aspect-[3/4] overflow-hidden mb-6 bg-espresso/5">
            <Image src="/accessories.png" alt="Accessories" fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
          </div>
          <h3 className="text-xl font-serif mb-2">Accessories</h3>
          <span className="text-sm text-espresso/70 uppercase tracking-wider group-hover:text-olive transition-colors">Shop Now →</span>
        </Link>
      </div>
      
      <div className="mt-12 text-center sm:hidden">
        <Link href="/collections" className="text-sm font-semibold uppercase tracking-widest border-b border-espresso pb-1 hover:text-olive hover:border-olive transition-colors">
          View All Categories
        </Link>
      </div>
    </section>
  );
}
