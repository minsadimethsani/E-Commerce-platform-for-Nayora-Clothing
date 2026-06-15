import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen">
      
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] flex items-center justify-center overflow-hidden bg-espresso">
        <Image 
          src="/heritage.png" 
          alt="The Nayora Heritage" 
          fill 
          className="object-cover object-center opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-espresso/40 z-10 pointer-events-none"></div>
        
        <div className="relative z-20 text-center px-6 flex flex-col items-center w-full max-w-4xl mx-auto">
          <span className="text-cream uppercase tracking-[0.4em] text-xs font-bold mb-6 drop-shadow-md">
            Our Heritage
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 text-cream leading-tight drop-shadow-md">
            Redefining Luxury
          </h1>
          <p className="text-lg md:text-xl text-cream/90 max-w-2xl font-light leading-relaxed drop-shadow-md">
            Founded on the principle that less is infinitely more. We create garments that outlast seasons and transcend trends.
          </p>
        </div>
      </section>

      {/* The Philosophy */}
      <section className="py-24 px-6 md:px-12 container mx-auto text-center max-w-4xl">
        <h2 className="text-3xl md:text-5xl font-serif font-bold mb-10 text-espresso leading-snug">
          "We don't design for the moment. We design for the lifetime of the wearer."
        </h2>
        <div className="w-16 h-[2px] bg-olive mx-auto mb-10"></div>
        <p className="text-lg text-espresso/80 leading-loose font-light">
          Nayora Clothing began as a quiet rebellion against fast fashion. In a world of fleeting trends, we chose to slow down. We source only the finest organic fibers, partner with multi-generational artisans, and obsess over the millimeter-perfect drape of every silhouette.
        </p>
      </section>

      {/* The 3 Pillars */}
      <section className="py-24 bg-espresso/5 border-y border-espresso/10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border border-espresso flex items-center justify-center mb-6">
                <span className="font-serif text-2xl">01</span>
              </div>
              <h3 className="text-xl font-bold uppercase tracking-widest mb-4">Pure Materials</h3>
              <p className="text-espresso/70 leading-relaxed font-light">
                From ethical cashmere to traceable organic cotton, every thread is selected for its supreme quality and minimal environmental impact.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border border-espresso flex items-center justify-center mb-6">
                <span className="font-serif text-2xl">02</span>
              </div>
              <h3 className="text-xl font-bold uppercase tracking-widest mb-4">Master Craft</h3>
              <p className="text-espresso/70 leading-relaxed font-light">
                We partner exclusively with family-owned ateliers in Europe, preserving centuries-old tailoring techniques in every piece we produce.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border border-espresso flex items-center justify-center mb-6">
                <span className="font-serif text-2xl">03</span>
              </div>
              <h3 className="text-xl font-bold uppercase tracking-widest mb-4">Fair Pricing</h3>
              <p className="text-espresso/70 leading-relaxed font-light">
                By bypassing traditional retail markups, we deliver ultra-luxury quality directly to you without the inflated luxury price tag.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Atelier / Visual Section */}
      <section className="py-24 px-6 md:px-12 container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/5] w-full overflow-hidden shadow-2xl">
            <Image 
              src="/women.png" 
              alt="Nayora Craftsmanship" 
              fill 
              className="object-cover" 
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-espresso uppercase tracking-[0.3em] text-xs font-bold mb-6">The Process</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 leading-tight">Elevated Essentials, Perfected.</h2>
            <p className="text-espresso/80 text-lg mb-8 leading-relaxed font-light">
              A single Nayora garment undergoes over 40 distinct quality checks before it reaches your hands. We believe true luxury isn't a logo—it's the feeling of slipping into a piece of clothing that was made entirely without compromise.
            </p>
            <p className="text-espresso/80 text-lg mb-12 leading-relaxed font-light">
              Experience the difference of intentional design.
            </p>
            
            {/* High-Conversion Focus: Drive them straight to product */}
            <div className="flex flex-col sm:flex-row gap-6">
              <Link 
                href="/collections" 
                className="px-10 py-5 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors text-center shadow-xl"
              >
                Experience The Quality
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="bg-olive text-cream py-16 text-center px-6">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-2xl md:text-3xl font-serif font-bold mb-6">The Nayora Guarantee</h3>
          <p className="text-cream/90 font-light text-lg mb-8">
            We stand behind every stitch. Enjoy complimentary shipping on all orders and a lifetime guarantee on our signature outerwear.
          </p>
          <Link 
            href="/new-arrivals" 
            className="inline-block border-b-2 border-cream pb-1 text-sm uppercase tracking-widest font-bold hover:text-espresso hover:border-espresso transition-colors"
          >
            Shop New Arrivals
          </Link>
        </div>
      </section>

    </div>
  );
}
