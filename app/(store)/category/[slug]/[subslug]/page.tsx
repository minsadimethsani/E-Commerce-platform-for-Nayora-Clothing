import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// ==========================================
// CLOUD FIRESTORE FILTERING SETUP
// ==========================================
// IMPORTANT: To activate the live database connection:
// 1. Run `npm install firebase` in your terminal
// 2. Uncomment the imports below and the Firestore logic inside the component
// 
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { getAllProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default async function SubCategoryPage({ params }: { params: Promise<{ slug: string, subslug: string }> }) {
  const { slug, subslug } = await params;
  
  let products: any[] = [];
  
  // ==========================================
  // CLOUD FIRESTORE FILTERING IMPLEMENTATION
  // ==========================================
  try {
    const productsRef = collection(db, "products");
    
    // Firestore query filtering by BOTH category and subCategory dynamically
    const q = query(
      productsRef, 
      where("category", "==", slug.toLowerCase()),
      where("subCategory", "==", subslug.toLowerCase())
    );
    
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach((doc) => {
      // Create a plain object that doesn't violate React Server Component serialization rules
      products.push({ 
        id: doc.id, 
        name: doc.data().name,
        category: doc.data().category,
        subCategory: doc.data().subCategory,
        price: doc.data().price,
        image: doc.data().image || "/hero.png" // Fallback image
      });
    });
  } catch (error) {
    console.error("Error fetching from Firestore:", error);
  }

  // Fallback to data from backend helper if Firestore isn't connected
  if (products.length === 0) {
    const allProducts = await getAllProducts();
    products = allProducts.filter(
      p => p.category === slug.toLowerCase() && p.subCategory === subslug.toLowerCase()
    );
  }

  // Format titles beautifully (e.g., "formal" -> "Formal")
  const displayCategory = slug.charAt(0).toUpperCase() + slug.slice(1);
  const displaySubCategory = subslug.charAt(0).toUpperCase() + subslug.slice(1);

  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen">
      
      {/* Sub-Category Hero Section */}
      <section className="relative w-full pt-6 md:pt-16 pb-8 bg-cream px-4 md:px-8">
        <div className="w-full max-w-7xl h-[40vh] md:h-[50vh] mx-auto relative overflow-hidden rounded-2xl md:rounded-[2rem] shadow-xl flex items-center justify-center bg-espresso">
          <Image 
            src={products.length > 0 ? products[0].image : "/hero.png"} 
            alt={`${displayCategory} ${displaySubCategory}`} 
            fill 
            className="object-cover object-center opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-espresso/50 z-10 pointer-events-none"></div>
          
          <div className="relative z-20 text-center px-6 flex flex-col items-center w-full max-w-3xl mx-auto">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-3 text-cream/80 uppercase tracking-[0.3em] text-xs font-bold mb-4 drop-shadow-md border-b border-cream/30 pb-2">
              <Link href={`/category/${slug}`} className="hover:text-cream transition-colors">{displayCategory}</Link>
              <span className="opacity-50">/</span>
              <span className="text-cream">{displaySubCategory}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 text-cream tracking-tight drop-shadow-md">
              {displaySubCategory} Edit
            </h1>
            <p className="text-base md:text-lg text-cream/90 font-light leading-relaxed drop-shadow-md max-w-xl mx-auto">
              Curated {displaySubCategory.toLowerCase()} pieces from our {displayCategory} collection. 
            </p>
          </div>
        </div>
      </section>

      {/* Product Grid Section */}
      <section className="container mx-auto px-4 md:px-8 py-24">
        <div className="flex justify-between items-center mb-12 text-sm border-b border-espresso/10 pb-6">
          <div className="text-espresso/60 font-medium uppercase tracking-widest">
            {products.length} Pieces
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {/* Empty State Fallback */}
        {products.length === 0 && (
          <div className="w-full py-32 text-center">
            <h3 className="text-2xl font-serif text-espresso mb-4">No pieces found</h3>
            <p className="text-espresso/60 mb-8">We couldn't find any {displaySubCategory.toLowerCase()} items for {displayCategory}.</p>
            <Link 
              href={`/category/${slug}`} 
              className="px-10 py-4 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors inline-block"
            >
              Return to {displayCategory}
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
