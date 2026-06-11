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

// Mock Fallback Data (Used until Firestore is configured)
const mockSubcategoryProducts = [
  { id: "w-form-1", name: "Structured Linen Suit", category: "women", subCategory: "formal", price: 550, image: "/women.png" },
  { id: "w-part-1", name: "Silk Evening Gown", category: "women", subCategory: "partywear", price: 890, image: "/heritage.png" },
  { id: "w-loung-1", name: "Cashmere Lounge Set", category: "women", subCategory: "loungewear", price: 320, image: "/hero.png" },
  { id: "w-cas-1", name: "Oversized Cotton Button-Down", category: "women", subCategory: "casual", price: 145, image: "/women.png" },
  { id: "m-cas-1", name: "Heavyweight Jersey Tee", category: "men", subCategory: "casual", price: 85, image: "/men.png" },
  { id: "m-form-1", name: "Double-Breasted Wool Blazer", category: "men", subCategory: "formal", price: 620, image: "/hero.png" },
  { id: "a-bags-1", name: "Woven Leather Tote", category: "accessories", subCategory: "bags", price: 350, image: "/accessories.png" },
  { id: "a-eye-1", name: "Acetate Sunglasses", category: "accessories", subCategory: "eyewear", price: 185, image: "/accessories.png" },
  { id: "a-jewel-1", name: "Gold Chain Necklace", category: "accessories", subCategory: "jewelry", price: 210, image: "/women.png" },
  { id: "a-acc-1", name: "Silk Scarf", category: "accessories", subCategory: "accents", price: 95, image: "/hero.png" },
];

export default async function SubCategoryPage({ params }: { params: Promise<{ slug: string, subslug: string }> }) {
  const { slug, subslug } = await params;
  
  let products = [];
  
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

  // Fallback to mock data for development demonstration if Firestore isn't connected
  if (products.length === 0) {
    products = mockSubcategoryProducts.filter(
      p => p.category === slug.toLowerCase() && p.subCategory === subslug.toLowerCase()
    );
  }

  // Format titles beautifully (e.g., "formal" -> "Formal")
  const displayCategory = slug.charAt(0).toUpperCase() + slug.slice(1);
  const displaySubCategory = subslug.charAt(0).toUpperCase() + subslug.slice(1);

  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen">
      
      {/* Sub-Category Hero Section */}
      <section className="relative w-full h-[50vh] flex items-center justify-center overflow-hidden bg-espresso">
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
          <div className="flex items-center gap-3 text-cream/80 uppercase tracking-[0.3em] text-xs font-bold mb-6 drop-shadow-md">
            <Link href={`/category/${slug}`} className="hover:text-olive transition-colors">{displayCategory}</Link>
            <span className="opacity-50">/</span>
            <span className="text-olive">{displaySubCategory}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-cream tracking-tight drop-shadow-md">
            {displaySubCategory} Edit
          </h1>
          <p className="text-lg text-cream/90 font-light leading-relaxed drop-shadow-md">
            Curated {displaySubCategory.toLowerCase()} pieces from our {displayCategory} collection. 
          </p>
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
