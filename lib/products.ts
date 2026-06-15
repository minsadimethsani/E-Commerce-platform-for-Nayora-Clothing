import { Product } from "@/data/cloths";
import { db } from "./firebase";
import { collection, getDocs, getDoc, doc, query, where } from "firebase/firestore";

// Helper to serialize and normalize Firestore data (converts Timestamps and normalizes fields)
function serializeData(data: any) {
  const serialized = { ...data };
  if (serialized.createdAt && typeof serialized.createdAt.toDate === 'function') {
    serialized.createdAt = serialized.createdAt.toDate().toISOString();
  }
  if (serialized.updatedAt && typeof serialized.updatedAt.toDate === 'function') {
    serialized.updatedAt = serialized.updatedAt.toDate().toISOString();
  }
  
  // Normalize schema differences (title -> name, base_price -> price, etc.)
  serialized.name = serialized.name || serialized.title || "";
  serialized.price = serialized.price !== undefined ? serialized.price : (serialized.base_price || 0);
  serialized.subCategory = serialized.subCategory || serialized.sub_category || "";
  
  const rawImage = serialized.image || serialized.image_url || "";
  const validLocalImages = [
    "/accessories.png", "/ankle_boots.png", "/brand-story.png", "/heritage.png", 
    "/hero.png", "/hero-v2.png", "/jersey_tee.png", "/leather_tote.png", "/men.png", 
    "/mens_blazer.png", "/pleated_skirt.png", "/silk_camisole.png", 
    "/slip_dress.png", "/women.png", "/womens_blazer.png"
  ];
  
  if (rawImage && !rawImage.startsWith('http') && !validLocalImages.includes(rawImage)) {
    const cat = (serialized.category || "").toLowerCase();
    if (cat === 'women') serialized.image = '/women.png';
    else if (cat === 'men') serialized.image = '/men.png';
    else if (cat === 'accessories') serialized.image = '/accessories.png';
    else serialized.image = '/hero.png';
  } else {
    serialized.image = rawImage || '/hero.png';
  }
  
  return serialized;
}

export async function getAllProducts(): Promise<Product[]> {
  const querySnapshot = await getDocs(collection(db, "products"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) } as Product));
}

export async function getProductById(slug: string): Promise<Product | undefined> {
  const docRef = doc(db, "products", slug);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...serializeData(docSnap.data()) } as Product;
  }
  return undefined;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  if (category.toLowerCase() === 'all') return getAllProducts();
  
  const q = query(collection(db, "products"), where("category", "==", category.toLowerCase()));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) } as Product));
}

export interface GetProductsOptions {
  category?: string;
  query?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function getPaginatedProducts(options: GetProductsOptions) {
  // Fetch all products first. For a larger app, this should be paginated via Firestore.
  // We do it this way to support full-text search on `name` which Firestore doesn't do natively.
  let result = await getAllProducts();

  // 1. Filter by category
  if (options.category && options.category.toLowerCase() !== 'all') {
    result = result.filter(p => p.category.toLowerCase() === options.category!.toLowerCase());
  }

  // 2. Search query
  if (options.query) {
    const rawQ = options.query.toLowerCase().trim();
    const tokens = rawQ.split(/\s+/).map(t => {
      // simple stemming: remove trailing 's' if it exists, to match plural/singular
      return t.endsWith('s') ? t.slice(0, -1) : t;
    });

    result = result.filter(p => {
      const safeName = p.name ? p.name.toLowerCase() : "";
      const safeCat = p.category ? p.category.toLowerCase() : "";
      const safeSubCat = p.subCategory ? p.subCategory.toLowerCase() : "";
      const safeColor = p.color ? p.color.toLowerCase() : "";

      // Ensure every token from the search query matches at least one product attribute
      return tokens.every(token => 
        safeName.includes(token) || 
        safeCat.includes(token) || 
        safeSubCat.includes(token) || 
        safeColor.includes(token) ||
        safeName.includes(rawQ) // fallback for exact phrase match
      );
    });
  }

  // 3. Sort
  if (options.sort) {
    switch (options.sort) {
      case 'Price: Low to High':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'Newest Arrivals':
        // Sort by createdAt descending if it exists
        result.sort((a, b) => {
          const aTime = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
          const bTime = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
          return bTime - aTime;
        });
        break;
      // Default: Featured (no sort change needed)
    }
  }

  // 4. Pagination
  const page = options.page || 1;
  const limit = options.limit || 9;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedResult = result.slice(startIndex, endIndex);

  return {
    products: paginatedResult,
    total: result.length,
    page,
    totalPages: Math.ceil(result.length / limit)
  };
}
