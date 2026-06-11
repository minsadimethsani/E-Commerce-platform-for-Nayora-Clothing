import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// Mock Product Data
const allProducts = [
  { id: 1, name: "Silk Blend Slip Dress", category: "women", price: 245, image: "/women.png" },
  { id: 2, name: "Tailored Linen Blazer", category: "men", price: 320, image: "/men.png" },
  { id: 3, name: "Woven Leather Tote", category: "accessories", price: 185, image: "/accessories.png" },
  { id: 4, name: "Organic Cotton Overcoat", category: "unisex", price: 450, image: "/hero.png" },
  { id: 5, name: "Cashmere Turtleneck", category: "women", price: 210, image: "/women.png" },
  { id: 6, name: "Pleated Wool Trousers", category: "men", price: 190, image: "/men.png" },
  { id: 7, name: "Suede Ankle Boots", category: "accessories", price: 290, image: "/accessories.png" },
  { id: 8, name: "Ribbed Knit Sweater", category: "men", price: 175, image: "/hero.png" },
];

const categoryMeta: Record<string, { title: string, description: string, coverImage: string }> = {
  women: { 
    title: "Womenswear", 
    description: "Feminine silhouettes defined by impeccable tailoring and fluid drape. Designed for the modern minimalist.", 
    coverImage: "/women.png" 
  },
  men: { 
    title: "Menswear", 
    description: "The modern uniform. Uncompromising structure meets everyday utility and comfort.", 
    coverImage: "/men.png" 
  },
  accessories: { 
    title: "Accessories", 
    description: "The final touch. Exceptional leather goods and elevated essentials crafted by European artisans.", 
    coverImage: "/accessories.png" 
  }
};

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = categoryMeta[slug.toLowerCase()];

  if (!meta) {
    notFound();
  }

  // Filter products for this category (and include unisex items for apparel)
  const categoryProducts = allProducts.filter(
    p => p.category === slug.toLowerCase() || (slug !== 'accessories' && p.category === 'unisex')
  );

  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen">
      
      {/* Category Hero Section */}
      <section className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden bg-espresso">
        <Image 
          src={meta.coverImage} 
          alt={meta.title} 
          fill 
          className="object-cover object-center opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-espresso/30 z-10 pointer-events-none"></div>
        
        <div className="relative z-20 text-center px-6 flex flex-col items-center w-full max-w-3xl mx-auto">
          <span className="text-cream uppercase tracking-[0.4em] text-xs font-bold mb-6 drop-shadow-md">
            The Collection
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-cream tracking-tight drop-shadow-md">
            {meta.title}
          </h1>
          <p className="text-lg text-cream/90 font-light leading-relaxed drop-shadow-md">
            {meta.description}
          </p>
        </div>
      </section>

      {/* Subcategory Navigation */}
      <section className="bg-espresso/5 border-b border-espresso/10 py-5">
        <div className="container mx-auto px-6 flex flex-wrap justify-center gap-8 md:gap-16 text-xs font-bold uppercase tracking-[0.2em] text-espresso/60">
          {slug.toLowerCase() === 'accessories' ? (
            <>
              <Link href={`/category/${slug}/bags`} className="hover:text-espresso transition-colors">Bags</Link>
              <Link href={`/category/${slug}/eyewear`} className="hover:text-espresso transition-colors">Eyewear</Link>
              <Link href={`/category/${slug}/jewelry`} className="hover:text-espresso transition-colors">Jewelry</Link>
              <Link href={`/category/${slug}/accents`} className="hover:text-espresso transition-colors">Accents</Link>
            </>
          ) : (
            <>
              <Link href={`/category/${slug}/formal`} className="hover:text-espresso transition-colors">Formal</Link>
              <Link href={`/category/${slug}/casual`} className="hover:text-espresso transition-colors">Casual</Link>
              <Link href={`/category/${slug}/loungewear`} className="hover:text-espresso transition-colors">Loungewear</Link>
              <Link href={`/category/${slug}/partywear`} className="hover:text-espresso transition-colors">Partywear</Link>
            </>
          )}
        </div>
      </section>

      {/* Product Grid Section */}
      <section className="container mx-auto px-4 md:px-8 py-16">
        <div className="flex justify-between items-center mb-12 text-sm border-b border-espresso/10 pb-6">
          <div className="text-espresso/60 font-medium uppercase tracking-widest">
            {categoryProducts.length} Pieces
          </div>
          <div className="flex items-center gap-4">
            <span className="text-espresso/60 uppercase tracking-widest text-[10px] font-bold">Sort</span>
            <select className="bg-transparent outline-none text-espresso font-medium cursor-pointer text-sm">
              <option>Curated</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {categoryProducts.map((product) => (
            <div key={product.id} className="group flex flex-col">
              <Link href={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden mb-5 bg-espresso/5">
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" 
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                  <button className="px-8 py-3 bg-olive text-cream text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#4A532B] transition-colors translate-y-4 group-hover:translate-y-0 duration-500 shadow-xl">
                    Add to Bag
                  </button>
                </div>
              </Link>
              <div className="flex flex-col text-center">
                <Link href={`/product/${product.id}`} className="text-lg font-serif mb-2 hover:text-olive transition-colors text-espresso">
                  {product.name}
                </Link>
                <span className="font-medium text-espresso/80 tracking-wide">${product.price}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Empty State Fallback */}
        {categoryProducts.length === 0 && (
          <div className="w-full py-32 text-center">
            <h3 className="text-2xl font-serif text-espresso mb-4">Collection Updating</h3>
            <p className="text-espresso/60 mb-8">New pieces are currently being added to this category. Please check back soon.</p>
            <Link 
              href="/collections" 
              className="px-10 py-4 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors"
            >
              View All Collections
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
