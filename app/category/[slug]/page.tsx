import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

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

  // Fetch all products and filter for this category (and include unisex items for apparel)
  const allProducts = await getAllProducts();
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
            <ProductCard key={product.id} product={product} />
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
