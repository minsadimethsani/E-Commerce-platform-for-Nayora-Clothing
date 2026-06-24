import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Fetch category metadata from Firestore
  const categoryDocRef = doc(db, "categories", slug.toLowerCase());
  const categorySnap = await getDoc(categoryDocRef);

  if (!categorySnap.exists() || categorySnap.data().isActive === false) {
    notFound();
  }

  const meta = categorySnap.data();
  const title = meta.title || meta.name || (slug.charAt(0).toUpperCase() + slug.slice(1));
  const description = meta.description || `Curated pieces from our ${title} collection.`;
  const heroImage = meta.heroImage || "/hero.png";
  const subCategories: string[] = meta.subCategories || [];

  // Fetch all products and filter for this category (and include unisex items for apparel)
  const allProducts = await getAllProducts();
  const categoryProducts = allProducts.filter(
    p => p.category === slug.toLowerCase() || (slug !== 'accessories' && p.category === 'unisex')
  );

  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen">
      
      {/* Category Hero Section */}
      <section className="relative w-full bg-cream">
        <div className="w-full h-[25vh] md:h-[30vh] relative overflow-hidden flex items-center justify-center bg-espresso">
          <Image 
            src={heroImage} 
            alt={title} 
            fill 
            className="object-cover object-center opacity-70"
            priority
          />
          <div className="absolute inset-0 bg-espresso/30 z-10 pointer-events-none"></div>
          
          <div className="relative z-20 text-center px-6 flex flex-col items-center w-full max-w-3xl mx-auto">
            <span className="text-cream uppercase tracking-[0.4em] text-[10px] md:text-xs font-bold mb-2 drop-shadow-md border-b border-cream/30 pb-1">
              The Collection
            </span>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-cream tracking-tight drop-shadow-md">
              {title}
            </h1>
          </div>
        </div>
      </section>

      {/* Category Description */}
      {description && (
        <div className="w-full max-w-3xl mx-auto text-center px-6 pt-10 pb-4 animate-in fade-in duration-500">
          <p className="text-sm md:text-base text-espresso/70 font-light leading-relaxed">
            {description}
          </p>
        </div>
      )}

      {/* Subcategory Navigation */}
      {subCategories.length > 0 && (
        <section className="bg-espresso/5 border-b border-espresso/10 py-5">
          <div className="container mx-auto px-6 flex flex-wrap justify-center gap-8 md:gap-16 text-xs font-bold uppercase tracking-[0.2em] text-espresso/60">
            {subCategories.map((sub) => (
              <Link 
                key={sub} 
                href={`/category/${slug}/${sub}`} 
                className="hover:text-espresso transition-colors capitalize"
              >
                {sub}
              </Link>
            ))}
          </div>
        </section>
      )}

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
