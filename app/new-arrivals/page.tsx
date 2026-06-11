import Image from "next/image";
import Link from "next/link";

const newProducts = [
  { id: 101, name: "The Midnight Trench", category: "Outerwear", price: 650, image: "/hero.png", tag: "Limited Run" },
  { id: 102, name: "Raw Silk Camisole", category: "Womenswear", price: 185, image: "/women.png", tag: "Selling Fast" },
  { id: 103, name: "Structured Linen Blazer", category: "Menswear", price: 420, image: "/men.png", tag: "Just Added" },
  { id: 104, name: "Woven Leather Satchel", category: "Accessories", price: 295, image: "/accessories.png", tag: "Editor's Pick" },
];

export default function NewArrivals() {
  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen">
      
      {/* Editorial Header */}
      <section className="relative w-full pt-32 pb-24 px-6 text-center border-b border-espresso/10 bg-gradient-to-b from-espresso/5 to-cream">
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
            <Link 
              href="/product/100" 
              className="inline-block px-12 py-5 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors text-center w-full sm:w-auto shadow-xl"
            >
              Pre-Order Now
            </Link>
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
              <div key={product.id} className="group flex flex-col relative">
                {/* High-conversion Tag */}
                <div className="absolute top-4 left-4 z-10 bg-cream/90 backdrop-blur-sm text-espresso text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 shadow-sm">
                  {product.tag}
                </div>
                
                <Link href={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden mb-6 bg-cream">
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out" 
                  />
                  {/* Quick Add CTA */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <button className="px-8 py-3 bg-olive text-cream text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#4A532B] transition-colors translate-y-4 group-hover:translate-y-0 duration-500 shadow-xl w-3/4">
                      Add to Bag
                    </button>
                  </div>
                </Link>
                
                <div className="flex flex-col text-center">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-espresso/50 mb-2 font-bold">{product.category}</span>
                  <Link href={`/product/${product.id}`} className="text-lg font-serif mb-2 hover:text-olive transition-colors text-espresso font-medium">
                    {product.name}
                  </Link>
                  <span className="font-semibold text-espresso/90">${product.price}</span>
                </div>
              </div>
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
