import { Product, ProductVariant } from "@/data/cloths";
import { db as firestoreDb } from "./firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, runTransaction } from "firebase/firestore";

export interface AdminProduct extends Product {
  quantity: number;
  variants?: ProductVariant[];
}

const ITEMS_PER_PAGE = 8;

// Helper to serialize Firestore data
function serializeData(data: any) {
  const serialized = { ...data };
  if (serialized.createdAt && typeof serialized.createdAt.toDate === 'function') {
    serialized.createdAt = serialized.createdAt.toDate().toISOString();
  }
  if (serialized.updatedAt && typeof serialized.updatedAt.toDate === 'function') {
    serialized.updatedAt = serialized.updatedAt.toDate().toISOString();
  }
  if (serialized.date && typeof serialized.date.toDate === 'function') {
    serialized.date = serialized.date.toDate().toISOString();
  }
  
  // Normalize schema differences (title -> name, base_price -> price, etc.)
  serialized.name = serialized.name || serialized.title || "Unnamed Product";
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

export async function getProducts(category: string = "all", page: number = 1) {
  try {
    const productsRef = collection(firestoreDb, "products");
    const snapshot = await getDocs(productsRef);
    let allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) } as AdminProduct));

    if (category && category !== "all") {
      allProducts = allProducts.filter(p => p.category === category);
    }
    
    // Sort so newest are first
    allProducts.sort((a, b) => {
      const aTime = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
      const bTime = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
      return bTime - aTime;
    });
    
    const totalItems = allProducts.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const safePage = Math.max(1, Math.min(page, totalPages || 1));
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    
    return {
      items: allProducts.slice(start, start + ITEMS_PER_PAGE),
      totalPages,
      totalItems,
      currentPage: safePage,
    };
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return { items: [], totalPages: 0, totalItems: 0, currentPage: 1 };
  }
}

export async function addProduct(product: Omit<AdminProduct, "id">) {
  try {
    const productsRef = collection(firestoreDb, "products");
    await addDoc(productsRef, {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
}

export async function removeProduct(id: string | number) {
  try {
    const productDoc = doc(firestoreDb, "products", String(id));
    await deleteDoc(productDoc);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

// ORDERS DB

export interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export interface Order {
  id: string;
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  address: string;
  totalAmount: number;
  paymentMethod: string;
  status: OrderStatus;
  date: string;
  items: OrderItem[];
}

export async function getOrders(statusFilter: string = "all", page: number = 1) {
  try {
    const ordersRef = collection(firestoreDb, "orders");
    const snapshot = await getDocs(ordersRef);
    let allOrders = snapshot.docs.map(doc => {
      const data = serializeData(doc.data());
      return {
        id: doc.id,
        orderNumber: data.orderNumber,
        customerName: data.shippingDetails?.name || data.customerName || "Unknown",
        customerEmail: data.shippingDetails?.email || data.customerEmail || "Unknown",
        customerPhone: data.shippingDetails?.phone || data.customerPhone || "N/A",
        address: data.shippingDetails?.address || data.address || "Unknown",
        totalAmount: data.totalAmount || 0,
        paymentMethod: data.paymentMethod || "Unknown",
        status: data.status || "Pending",
        date: data.createdAt || data.date || new Date().toISOString(),
        items: data.items || []
      } as Order;
    });
    
    allOrders.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    
    if (statusFilter && statusFilter !== "all") {
      allOrders = allOrders.filter(o => o.status.toLowerCase() === statusFilter.toLowerCase());
    }
    
    const totalItems = allOrders.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const safePage = Math.max(1, Math.min(page, totalPages || 1));
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    
    return {
      items: allOrders.slice(start, start + ITEMS_PER_PAGE),
      totalPages,
      totalItems,
      currentPage: safePage,
    };
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return { items: [], totalPages: 0, totalItems: 0, currentPage: 1 };
  }
}

export async function updateOrderStatus(id: string, newStatus: OrderStatus) {
  try {
    const orderDoc = doc(firestoreDb, "orders", id);
    await updateDoc(orderDoc, { status: newStatus });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}

export async function updateVariantStock(productId: string, skuId: string, newStock: number) {
  try {
    const productRef = doc(firestoreDb, "products", productId);
    await runTransaction(firestoreDb, async (transaction) => {
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists()) {
        throw new Error("Product does not exist");
      }
      
      const data = productDoc.data();
      const variants = data.variants || [];
      
      // Legacy fallback: if product has no variants, update the base quantity directly
      if (variants.length === 0) {
        transaction.update(productRef, {
          quantity: newStock,
          updatedAt: serverTimestamp()
        });
        return;
      }

      let updated = false;
      let newTotalQuantity = 0;

      const newVariants = variants.map((v: any) => {
        if (v.SKU_ID === skuId) {
          updated = true;
          newTotalQuantity += newStock;
          return { ...v, stock_quantity: newStock };
        }
        newTotalQuantity += v.stock_quantity || 0;
        return v;
      });

      if (!updated) {
        throw new Error(`Variant with SKU ${skuId} not found in product`);
      }

      transaction.update(productRef, {
        variants: newVariants,
        quantity: newTotalQuantity,
        updatedAt: serverTimestamp()
      });
    });
  } catch (error) {
    console.error("Error updating variant stock:", error);
    throw error;
  }
}

