import { Product } from "@/data/cloths";
import { db } from "./firebase";
import { collection, getDocs, getDoc, doc, query, where } from "firebase/firestore";

// Helper to serialize Firestore data (converts Timestamps to ISO strings)
function serializeData(data: any) {
  const serialized = { ...data };
  if (serialized.createdAt && typeof serialized.createdAt.toDate === 'function') {
    serialized.createdAt = serialized.createdAt.toDate().toISOString();
  }
  if (serialized.updatedAt && typeof serialized.updatedAt.toDate === 'function') {
    serialized.updatedAt = serialized.updatedAt.toDate().toISOString();
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
    const q = options.query.toLowerCase().replace(/s$/, ""); // remove trailing 's' for simple plural matching (e.g., womens -> women)
    const rawQ = options.query.toLowerCase();
    result = result.filter(p => {
      const safeName = p.name ? p.name.toLowerCase() : "";
      const safeCat = p.category ? p.category.toLowerCase() : "";
      const safeSubCat = p.subCategory ? p.subCategory.toLowerCase() : "";
      const safeColor = p.color ? p.color.toLowerCase() : "";

      const nameMatch = safeName.includes(rawQ) || safeName.includes(q);
      const catMatch = safeCat.includes(rawQ) || safeCat.includes(q);
      const subCatMatch = safeSubCat.includes(rawQ) || safeSubCat.includes(q);
      const colorMatch = safeColor.includes(rawQ) || safeColor.includes(q);

      return nameMatch || catMatch || subCatMatch || colorMatch;
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
