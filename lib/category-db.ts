import { db as firestoreDb } from "./firebase";
import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";

export interface Category {
  id?: string;
  name: string;
  slug: string;
  subCategories: string[];
  createdAt?: any;
}

// Convert name to slug
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Default Seed Categories
const DEFAULT_CATEGORIES: Omit<Category, "id">[] = [
  { name: "Women", slug: "women", subCategories: ["formal", "casual", "loungewear", "partywear"] },
  { name: "Men", slug: "men", subCategories: ["formal", "casual", "loungewear"] },
  { name: "Accessories", slug: "accessories", subCategories: ["bags", "eyewear", "jewelry", "accents"] },
  { name: "Unisex", slug: "unisex", subCategories: ["casual", "loungewear"] }
];

// Helper to seed default categories if collection is empty
async function seedDefaultCategoriesIfEmpty(): Promise<void> {
  try {
    const categoriesRef = collection(firestoreDb, "categories");
    const snapshot = await getDocs(categoriesRef);

    if (snapshot.empty) {
      console.log("[SEED] Categories collection is empty. Seeding defaults...");
      const batch = writeBatch(firestoreDb);
      
      DEFAULT_CATEGORIES.forEach((cat) => {
        const newDocRef = doc(collection(firestoreDb, "categories"));
        batch.set(newDocRef, {
          ...cat,
          createdAt: new Date() // fallback date
        });
      });

      await batch.commit();
      console.log("[SEED] Default categories successfully seeded!");
    }
  } catch (error) {
    console.error("Failed to seed default categories:", error);
  }
}

// Get all categories (handles auto-seeding if empty)
export async function getAllCategories(): Promise<Category[]> {
  try {
    await seedDefaultCategoriesIfEmpty();

    const categoriesRef = collection(firestoreDb, "categories");
    const q = query(categoriesRef, orderBy("name", "asc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        slug: data.slug,
        subCategories: data.subCategories || [],
        createdAt: data.createdAt
      } as Category;
    });
  } catch (error) {
    console.error("Error getting all categories:", error);
    
    // Fallback: in-memory try without ordering in case index hasn't been built yet
    try {
      const categoriesRef = collection(firestoreDb, "categories");
      const snapshot = await getDocs(categoriesRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category));
    } catch (fallbackError) {
      console.error("Fallback error getting categories:", fallbackError);
      return [];
    }
  }
}

// Create a new category
export async function createCategory(name: string, subCategories: string[]): Promise<Category> {
  try {
    const categoriesRef = collection(firestoreDb, "categories");
    const slug = generateSlug(name);
    
    // Validate slug is unique (or we can append if needed, but uniqueness is better)
    const snapshot = await getDocs(categoriesRef);
    const existingSlugs = snapshot.docs.map(doc => doc.data().slug);
    if (existingSlugs.includes(slug)) {
      throw new Error(`A category with slug '${slug}' already exists.`);
    }

    const cleanSubCategories = subCategories
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 0);

    const data = {
      name: name.trim(),
      slug,
      subCategories: cleanSubCategories,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(categoriesRef, data);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
}

// Update a category
export async function updateCategory(id: string, name: string, subCategories: string[]): Promise<void> {
  try {
    const categoryDoc = doc(firestoreDb, "categories", id);
    const slug = generateSlug(name);
    const cleanSubCategories = subCategories
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 0);

    await updateDoc(categoryDoc, {
      name: name.trim(),
      slug,
      subCategories: cleanSubCategories
    });
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
}

// Delete a category
export async function deleteCategory(id: string): Promise<void> {
  try {
    const categoryDoc = doc(firestoreDb, "categories", id);
    await deleteDoc(categoryDoc);
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}
