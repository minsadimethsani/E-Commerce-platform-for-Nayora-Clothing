"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Check, 
  Loader2, 
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateVariantStock } from "@/lib/db";
import { Product } from "@/data/cloths";

export default function InventoryDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [savingSku, setSavingSku] = useState<string | null>(null);
  const [saveSuccessSku, setSaveSuccessSku] = useState<string | null>(null);

  // Subscribe to real-time updates for this specific product
  useEffect(() => {
    if (!id) return;
    const docRef = doc(db, "products", id);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({
            ...data,
            id: docSnap.id,
            name: data.name || data.title || "Unnamed Product",
            category: data.category || "unisex",
            price: data.price !== undefined ? data.price : (data.base_price || 0),
            image: data.image || data.image_url || "/hero.png"
          } as Product);
        } else {
          setProduct(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error subscribing to product:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3 bg-white border border-neutral-100 rounded-xl shadow-sm">
        <Loader2 className="w-8 h-8 text-neutral-900 animate-spin" />
        <p className="text-sm text-neutral-500">Loading product inventory from Firestore...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 bg-white border border-neutral-100 rounded-xl shadow-sm">
        <h2 className="text-2xl font-serif text-neutral-800 mb-4">Product Not Found</h2>
        <p className="text-neutral-500 mb-6 text-sm">The product with ID "{id}" could not be located.</p>
        <Link 
          href="/admin/inventory"
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Inventory Overview
        </Link>
      </div>
    );
  }

  // Extract variants or create default fallback variant
  const variants = product.variants && product.variants.length > 0
    ? product.variants
    : [{
        SKU_ID: `NYR-${String(product.id).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10)}-DEFAULT-S`,
        color: product.color || "Default",
        size: "S",
        stock_quantity: (product as any).quantity !== undefined ? (product as any).quantity : 0
      }];

  const handleStockChange = (skuId: string, val: string) => {
    const parsed = parseInt(val);
    setEditingStock(prev => ({
      ...prev,
      [skuId]: isNaN(parsed) ? 0 : Math.max(0, parsed)
    }));
  };

  const handleSaveStock = async (skuId: string) => {
    const newValue = editingStock[skuId];
    if (newValue === undefined) return;

    try {
      setSavingSku(skuId);
      await updateVariantStock(product.id as string, skuId, newValue);
      
      setSaveSuccessSku(skuId);
      setTimeout(() => setSaveSuccessSku(null), 1500);

      setEditingStock(prev => {
        const copy = { ...prev };
        delete copy[skuId];
        return copy;
      });
    } catch (err) {
      console.error("Failed to save stock:", err);
      alert("Failed to update stock. Please try again.");
    } finally {
      setSavingSku(null);
    }
  };

  const renderStockBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          Out of Stock
        </span>
      );
    } else if (stock >= 1 && stock <= 5) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 mr-1" />
          Low Stock ({stock})
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          In Stock ({stock})
        </span>
      );
    }
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
      {/* Header */}
      <div>
        <Link 
          href="/admin/inventory"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Inventory Overview
        </Link>
        <h1 className="text-3xl font-serif font-bold text-neutral-900">{product.name} — Variants Stock</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage variant-level SKU quantities, sizes, and colors for this specific product in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Card: Product Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
            <div className="aspect-[3/4] relative rounded-lg overflow-hidden bg-neutral-50 border border-neutral-100">
              <img 
                src={product.image || "/hero.png"} 
                alt={product.name} 
                className="w-full h-full object-cover object-center" 
              />
            </div>
            <div>
              <span className="text-xs text-neutral-400 block font-medium">Category</span>
              <span className="font-semibold text-neutral-800 capitalize">{product.category}</span>
            </div>
            <div>
              <span className="text-xs text-neutral-400 block font-medium">Price</span>
              <span className="font-semibold text-neutral-800">LKR {product.price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Card: Variants Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden p-6 space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center justify-between">
            <span>SKU Inventory Details</span>
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-455">
              <RefreshCw className="w-3 h-3 animate-spin text-neutral-500" /> Auto-syncing
            </div>
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">SKU ID</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Color</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Size</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Stock Status</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-neutral-500 uppercase tracking-wider">Update Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {variants.map((v) => {
                  const currentStockVal = editingStock[v.SKU_ID] !== undefined ? editingStock[v.SKU_ID] : v.stock_quantity;
                  const isModified = editingStock[v.SKU_ID] !== undefined && editingStock[v.SKU_ID] !== v.stock_quantity;
                  const isSaving = savingSku === v.SKU_ID;
                  const isSuccess = saveSuccessSku === v.SKU_ID;

                  return (
                    <tr 
                      key={v.SKU_ID} 
                      className={`text-neutral-700 hover:bg-neutral-50/50 transition-colors ${isSuccess ? 'bg-emerald-50/40 hover:bg-emerald-50/40' : ''}`}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-neutral-500">{v.SKU_ID}</td>
                      <td className="px-4 py-3 capitalize">{v.color || "Default"}</td>
                      <td className="px-4 py-3 font-medium">{v.size}</td>
                      <td className="px-4 py-3">{renderStockBadge(v.stock_quantity)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={currentStockVal}
                            disabled={isSaving}
                            onChange={(e) => handleStockChange(v.SKU_ID, e.target.value)}
                            className="w-16 bg-white text-neutral-900 text-center py-1 border border-neutral-300 rounded shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 disabled:opacity-50"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveStock(v.SKU_ID)}
                            disabled={!isModified || isSaving}
                            className={`p-1.5 rounded border text-xs transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-neutral-900 ${
                              isSuccess 
                                ? 'bg-[#2E7D32] border-[#2E7D32] text-white shadow-md' 
                                : isModified
                                  ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-900 text-white shadow-md cursor-pointer'
                                  : 'bg-white border-neutral-200 text-neutral-300 cursor-not-allowed'
                            }`}
                            title="Save variant stock"
                          >
                            {isSaving ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : isSuccess ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Save className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
