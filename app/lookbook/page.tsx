import Image from "next/image";
import Link from "next/link";
import { getProductById } from "@/lib/products";

const looksData = [
  {
    id: "01",
    title: "The Autumn Transition",
    description: "A masterclass in layering. Blending organic textures with sharp, structured outerwear for an effortlessly sophisticated silhouette.",
    image: "/hero.png",
    productIds: ["organic-cotton-overcoat", "cashmere-turtleneck", "suede-ankle-boots"]
  },
  {
    id: "02",
    title: "Modern Minimalism",
    description: "Stripping back to the absolute essentials. A study in proportion featuring our signature tailored separates and a perfectly draped silk top.",
    image: "/women.png",
    productIds: ["raw-silk-camisole", "silk-blend-slip-dress"]
  },
  {
    id: "03",
    title: "The Urban Uniform",
    description: "Redefining the daily standard. Uncompromising tailoring meets performance fabrics to create the ultimate modern uniform for the city.",
    image: "/men.png",
    productIds: ["tailored-linen-blazer", "heavyweight-jersey-tee", "woven-leather-tote"]
  }
];

export default async function LookbookPage() {
  // Fetch all the product details dynamically
  const looks = await Promise.all(
    looksData.map(async (look) => {
      const products = await Promise.all(
        look.productIds.map(id => getProductById(id))
      );
      // Filter out any undefined products just in case
      return { ...look, products: products.filter(Boolean) as any[] };
    })
  );

  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen">
      
      {/* Header */}
      <section className="pt-32 pb-20 px-6 text-center border-b border-espresso/10">
        <span className="text-espresso uppercase tracking-[0.3em] text-xs font-bold mb-6 block">
          Editorial
        </span>
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 text-espresso tracking-tight">
          Shop The Look
        </h1>
        <p className="text-lg text-espresso/70 max-w-xl mx-auto font-light leading-relaxed">
          Discover how to style the season's most coveted pieces. Curated looks straight from our design atelier.
        </p>
      </section>

      {/* Looks */}
      <div className="flex flex-col">
        {looks.map((look, index) => (
          <section key={look.id} className={`flex flex-col lg:flex-row min-h-screen border-b border-espresso/10 ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
            
            {/* Massive Editorial Image */}
            <div className="w-full lg:w-1/2 relative min-h-[60vh] lg:min-h-screen overflow-hidden group">
              <Image 
                src={look.image} 
                alt={look.title} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-[2s] ease-out" 
              />
              <div className="absolute inset-0 bg-espresso/10 pointer-events-none"></div>
              
              {/* Floating Look Number */}
              <div className="absolute top-8 left-8 lg:top-12 lg:left-12">
                <span className="text-6xl font-serif text-cream drop-shadow-md font-bold opacity-90">
                  {look.id}
                </span>
              </div>
            </div>

            {/* Look Details & Products */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20 bg-espresso/5">
              <div className="max-w-md mx-auto w-full">
                <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">{look.title}</h2>
                <p className="text-espresso/70 text-lg leading-relaxed font-light mb-16">
                  {look.description}
                </p>

                <h3 className="text-xs uppercase tracking-widest font-bold border-b border-espresso/20 pb-4 mb-8">
                  Featured Pieces
                </h3>

                {/* Product Mini-Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                  {look.products.map((product) => (
                    <Link key={product.id} href={`/product/${product.id}`} className="group flex flex-col">
                      <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-cream">
                        <Image 
                          src={product.image || "/hero.png"} 
                          alt={product.name || "Product"} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                        />
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="bg-cream text-espresso text-[9px] uppercase tracking-[0.2em] font-bold px-4 py-2 shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                            View Item
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-serif text-lg text-espresso group-hover:text-olive transition-colors mb-1">
                          {product.name}
                        </span>
                        <span className="font-medium text-espresso/80">
                          ${product.price}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                <button className="w-full py-5 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors shadow-lg">
                  Add Full Look To Bag
                </button>
              </div>
            </div>

          </section>
        ))}
      </div>
      
    </div>
  );
}
