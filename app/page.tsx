import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col w-full bg-cream text-espresso">
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden bg-cream">
        <Image 
          src="/hero.png" 
          alt="Nayora Premium Collection" 
          fill 
          className="object-cover object-center opacity-90"
          priority
        />
        {/* Changed to a light overlay so dark text is readable */}
        <div className="absolute inset-0 bg-cream/40 z-10 pointer-events-none"></div>
        
        <div className="relative z-20 text-center px-4 flex flex-col items-center w-full max-w-4xl mx-auto">
          <span className="text-espresso uppercase tracking-[0.3em] text-sm md:text-base font-bold mb-6 drop-shadow-sm">
            The New Standard
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-8 text-espresso leading-tight drop-shadow-sm">
            Elevated Essentials
          </h1>
          <p className="text-lg md:text-xl text-espresso/90 max-w-2xl mb-12 font-medium leading-relaxed drop-shadow-sm">
            Discover our latest collection blending timeless espresso tones with organic textures. Designed for the sophisticated minimalist.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto justify-center">
            <Link 
              href="/collections" 
              className="px-10 py-4 bg-[#9F8170] text-cream text-sm uppercase tracking-widest font-bold hover:bg-[#8C7162] transition-colors text-center rounded-md shadow-2xl"
            >
              Shop Collection
            </Link>
            <Link 
              href="/lookbook" 
              className="px-10 py-4 bg-[#8C7162] text-cream text-sm uppercase tracking-widest font-bold hover:bg-[#9F8170] transition-colors text-center rounded-md shadow-2xl"
            >
              Explore Lookbook
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Statement */}
      <section className="py-24 px-6 md:px-12 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-serif leading-snug text-espresso">
          "Simplicity is the ultimate sophistication. We craft garments that speak through silhouette and texture."
        </h2>
        <div className="mt-8 w-12 h-[1px] bg-olive mx-auto"></div>
      </section>

      {/* Categories */}
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
      
      {/* Brand Value Section */}
      <section className="py-24 mt-12 bg-espresso text-cream">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 flex flex-col justify-center">
            <h2 className="text-3xl md:text-5xl font-serif mb-8 leading-tight">Crafted with Intention, Designed for Life.</h2>
            <p className="text-cream/80 text-lg mb-10 leading-relaxed font-light">
              At Nayora Clothing, we believe that every piece in your wardrobe should serve a purpose. We source the finest sustainable materials to create garments that outlast trends and become true staples in your everyday journey.
            </p>
            <div>
              <Link href="/about" className="inline-block px-8 py-4 bg-cream text-espresso text-sm uppercase tracking-widest font-semibold hover:bg-olive hover:text-cream transition-colors">
                Read Our Story
              </Link>
            </div>
          </div>
          <div className="order-1 md:order-2 relative aspect-square md:aspect-[4/5] bg-cream/10">
            <Image src="/hero.png" alt="Nayora Brand Value" fill className="object-cover object-center" />
          </div>
        </div>
      </section>
    </div>
  );
}
