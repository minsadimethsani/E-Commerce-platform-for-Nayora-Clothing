import { db as firestoreDb } from "./firebase";
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc,
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
  isActive?: boolean;
  title?: string;
  heroImage?: string;
  description?: string;
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

// Consolidation helper to merge legacy double-schema categories
async function consolidateCategories(): Promise<void> {
  try {
    const categoriesRef = collection(firestoreDb, "categories");
    const snapshot = await getDocs(categoriesRef);
    if (snapshot.empty) return;

    const docs = snapshot.docs;
    const slugGroups: Record<string, { metadataDoc?: any; subcategoryDoc?: any }> = {};
    
    for (const docSnap of docs) {
      const id = docSnap.id;
      const data = docSnap.data();
      const slug = data.slug || id;
      
      if (!slug) continue;
      const normalizedSlug = slug.toLowerCase().trim();
      
      if (!slugGroups[normalizedSlug]) {
        slugGroups[normalizedSlug] = {};
      }
      
      if (id.toLowerCase().trim() === normalizedSlug) {
        slugGroups[normalizedSlug].metadataDoc = docSnap;
      } else {
        slugGroups[normalizedSlug].subcategoryDoc = docSnap;
      }
    }
    
    const batch = writeBatch(firestoreDb);
    let hasChanges = false;
    
    for (const [slug, group] of Object.entries(slugGroups)) {
      if (group.subcategoryDoc) {
        const subData = group.subcategoryDoc.data();
        const subCategories = subData.subCategories || [];
        const name = subData.name || subData.title || slug;
        
        if (group.metadataDoc) {
          const metaData = group.metadataDoc.data();
          const mergedSubCategories = Array.from(new Set([
            ...(metaData.subCategories || []),
            ...subCategories
          ]));
          
          batch.update(group.metadataDoc.ref, {
            subCategories: mergedSubCategories,
            name: name,
            slug: slug,
            title: metaData.title || name,
            isActive: metaData.isActive !== false,
            updatedAt: new Date()
          });
          
          batch.delete(group.subcategoryDoc.ref);
          hasChanges = true;
          console.log(`[CONSOLIDATE] Merged duplicate subcategory doc ${group.subcategoryDoc.id} into metadata doc ${slug}`);
        } else {
          const newDocRef = doc(firestoreDb, "categories", slug);
          batch.set(newDocRef, {
            name: name,
            slug: slug,
            subCategories: subCategories,
            isActive: true,
            title: name,
            heroImage: "/hero.png",
            description: `Curated ${name} fashion collection.`,
            createdAt: subData.createdAt || new Date()
          });
          
          batch.delete(group.subcategoryDoc.ref);
          hasChanges = true;
          console.log(`[CONSOLIDATE] Created metadata doc for slug ${slug} and deleted legacy doc ${group.subcategoryDoc.id}`);
        }
      } else if (group.metadataDoc) {
        const metaData = group.metadataDoc.data();
        if (!metaData.subCategories || metaData.name === undefined || metaData.slug === undefined) {
          batch.update(group.metadataDoc.ref, {
            subCategories: metaData.subCategories || [],
            name: metaData.name || metaData.title || slug,
            slug: slug,
            isActive: metaData.isActive !== false
          });
          hasChanges = true;
          console.log(`[CONSOLIDATE] Initialized fields for slug ${slug}`);
        }
      }
    }
    
    if (hasChanges) {
      await batch.commit();
      console.log("[CONSOLIDATE] Database consolidation completed successfully!");
    }
  } catch (error) {
    console.error("[CONSOLIDATE] Failed to consolidate categories:", error);
  }
}

// Helper to seed default categories if collection is empty
async function seedDefaultCategoriesIfEmpty(): Promise<void> {
  try {
    const categoriesRef = collection(firestoreDb, "categories");
    const snapshot = await getDocs(categoriesRef);

    if (snapshot.empty) {
      console.log("[SEED] Categories collection is empty. Seeding defaults...");
      const batch = writeBatch(firestoreDb);
      
      DEFAULT_CATEGORIES.forEach((cat) => {
        const newDocRef = doc(firestoreDb, "categories", cat.slug);
        batch.set(newDocRef, {
          ...cat,
          title: cat.name + (cat.slug !== "accessories" && cat.slug !== "unisex" ? "'s Collection" : ""),
          description: cat.slug === "women" ? "Discover the latest trends in women's fashion." :
                       cat.slug === "men" ? "Elevate your wardrobe with our men's essentials." :
                       cat.slug === "accessories" ? "The perfect finishing touches to any outfit." :
                       "Versatile pieces designed for everyone.",
          heroImage: cat.slug === "women" ? "/women.png" :
                     cat.slug === "men" ? "/men.png" :
                     cat.slug === "accessories" ? "/accessories.png" :
                     "/heritage.png",
          isActive: true,
          createdAt: new Date()
        });
      });

      await batch.commit();
      console.log("[SEED] Default categories successfully seeded!");
    }
  } catch (error) {
    console.error("Failed to seed default categories:", error);
  }
}

// Helper to serialize Firestore category data
function serializeCategory(id: string, data: any): Category {
  const serialized = { ...data };
  
  if (serialized.createdAt && typeof serialized.createdAt.toDate === 'function') {
    serialized.createdAt = serialized.createdAt.toDate().toISOString();
  } else if (serialized.createdAt && typeof serialized.createdAt.seconds === 'number') {
    serialized.createdAt = new Date(serialized.createdAt.seconds * 1000).toISOString();
  } else if (serialized.createdAt) {
    serialized.createdAt = new Date(serialized.createdAt).toISOString();
  } else {
    serialized.createdAt = new Date().toISOString();
  }

  return {
    id,
    name: serialized.name || serialized.title || id,
    slug: serialized.slug || id,
    subCategories: serialized.subCategories || [],
    isActive: serialized.isActive !== false,
    title: serialized.title || serialized.name || id,
    heroImage: serialized.heroImage || "/hero.png",
    description: serialized.description || "",
    createdAt: serialized.createdAt
  };
}

// Get all categories (handles auto-seeding if empty)
export async function getAllCategories(): Promise<Category[]> {
  try {
    await seedDefaultCategoriesIfEmpty();
    await consolidateCategories();

    const categoriesRef = collection(firestoreDb, "categories");
    const snapshot = await getDocs(categoriesRef);
    
    const cats = snapshot.docs.map(doc => serializeCategory(doc.id, doc.data()));
    // Sort alphabetically by name
    cats.sort((a, b) => a.name.localeCompare(b.name));
    return cats;
  } catch (error) {
    console.error("Error getting all categories:", error);
    
    // Fallback: in-memory try without ordering or consolidation
    try {
      const categoriesRef = collection(firestoreDb, "categories");
      const snapshot = await getDocs(categoriesRef);
      return snapshot.docs.map(doc => serializeCategory(doc.id, doc.data()));
    } catch (fallbackError) {
      console.error("Fallback error getting categories:", fallbackError);
      return [];
    }
  }
}

// Create a new category
export async function createCategory(name: string, subCategories: string[]): Promise<Category> {
  try {
    const slug = generateSlug(name);
    const categoryDoc = doc(firestoreDb, "categories", slug);
    
    // Validate slug is unique
    const snapshot = await getDoc(categoryDoc);
    if (snapshot.exists()) {
      throw new Error(`A category with name '${name}' (slug '${slug}') already exists.`);
    }

    const cleanSubCategories = subCategories
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 0);

    const data = {
      name: name.trim(),
      slug,
      subCategories: cleanSubCategories,
      isActive: true,
      title: name.trim(),
      heroImage: "/hero.png",
      description: `Curated ${name.trim()} fashion collection.`,
      createdAt: serverTimestamp()
    };

    await setDoc(categoryDoc, data);
    return {
      id: slug,
      name: data.name,
      slug: data.slug,
      subCategories: data.subCategories,
      isActive: true,
      title: data.title,
      heroImage: data.heroImage,
      description: data.description,
      createdAt: new Date().toISOString()
    };
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

    const categorySnap = await getDoc(categoryDoc);
    const currentData = categorySnap.exists() ? categorySnap.data() : {};

    const updatedData = {
      ...currentData,
      name: name.trim(),
      slug,
      subCategories: cleanSubCategories,
      title: currentData.title || name.trim(),
      heroImage: currentData.heroImage || "/hero.png",
      description: currentData.description || `Curated ${name.trim()} fashion collection.`,
      updatedAt: serverTimestamp()
    };

    // If the ID is the same, we update it.
    // If name changed such that slug is different, we can either write to a new doc and delete the old one,
    // but in e-commerce, it's safer to keep the document ID the same to avoid breaking product relations!
    // Since products link to categories by the slug string (e.g. product.category === 'accessories'),
    // changing slug means we would have to update all products!
    // So keeping ID same is safe, but we also update the fields.
    await setDoc(categoryDoc, updatedData);
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
