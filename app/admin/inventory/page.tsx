"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { 
  Search, 
  Filter, 
  Save, 
  Check, 
  Loader2, 
  ArrowUpDown, 
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateVariantStock } from "@/lib/db";
import { Product, ProductVariant } from "@/data/cloths";

interface FlattenedSKU {
  productId: string;
  productTitle: string;
  image: string;
  category: string;
  skuId: string;
  color: string;
  size: string | number;
  stock: number;
}

export default function InventoryDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStockStatus, setSelectedStockStatus] = useState("all");
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [savingSku, setSavingSku] = useState<string | null>(null);
  const [saveSuccessSku, setSaveSuccessSku] = useState<string | null>(null);

  // Subscribe to real-time updates from products collection
  useEffect(() => {
    const productsRef = collection(db, "products");
    const unsubscribe = onSnapshot(
      productsRef,
      (snapshot) => {
        const loadedProducts: Product[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          // Normalize price, name, images
          return {
            ...data,
            id: doc.id,
            name: data.name || data.title || "Unnamed Product",
            category: data.category || "unisex",
            price: data.price !== undefined ? data.price : (data.base_price || 0),
            image: data.image || data.image_url || "/hero.png"
          } as Product;
        });
        setProducts(loadedProducts);
        setLoading(false);
      },
      (error) => {
        console.error("Error subscribing to products:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Flatten products and variants
  const getFlattenedSKUs = (): FlattenedSKU[] => {
    const rows: FlattenedSKU[] = [];
    products.forEach((p) => {
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v) => {
          rows.push({
            productId: String(p.id),
            productTitle: p.name,
            image: p.image,
            category: p.category,
            skuId: v.SKU_ID,
            color: v.color,
            size: v.size,
            stock: v.stock_quantity
          });
        });
      } else {
        // legacy product fallback
        const cleanName = p.name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
        const cleanColor = (p.color || "DEFAULT").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
        const skuId = `NYR-${cleanName}-${cleanColor}-S`;

        rows.push({
          productId: String(p.id),
          productTitle: p.name,
          image: p.image,
          category: p.category,
          skuId: skuId,
          color: p.color || "Default",
          size: "S",
          stock: (p as any).quantity !== undefined ? (p as any).quantity : 0
        });
      }
    });
    return rows;
  };

  const allSKUs = getFlattenedSKUs();

  // Filter SKUs
  const filteredSKUs = allSKUs.filter((sku) => {
    const matchesSearch = 
      sku.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sku.skuId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sku.color.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "all" || 
      sku.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesStock = 
      selectedStockStatus === "all" ||
      (selectedStockStatus === "out" && sku.stock === 0) ||
      (selectedStockStatus === "low" && sku.stock >= 1 && sku.stock <= 5) ||
      (selectedStockStatus === "in" && sku.stock > 5);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleStockChange = (skuId: string, val: string) => {
    const parsed = parseInt(val);
    setEditingStock(prev => ({
      ...prev,
      [skuId]: isNaN(parsed) ? 0 : Math.max(0, parsed)
    }));
  };

  const handleSaveStock = async (productId: string, skuId: string) => {
    const newValue = editingStock[skuId];
    if (newValue === undefined) return;

    try {
      setSavingSku(skuId);
      await updateVariantStock(productId, skuId, newValue);
      
      // Show success animation
      setSaveSuccessSku(skuId);
      setTimeout(() => setSaveSuccessSku(null), 1500);

      // Clean up editing state
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
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm animate-pulse">
          Out of Stock
        </span>
      );
    } else if (stock >= 1 && stock <= 5) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
          <AlertTriangle className="w-3.5 h-3.5 mr-1" />
          Low Stock ({stock})
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
          In Stock ({stock})
        </span>
      );
    }
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-neutral-900 tracking-tight">Inventory Management</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Monitor apparel items, track individual SKUs, and instantly update stock values in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-500 shadow-sm">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-neutral-700' : ''}`} />
          {loading ? 'Syncing with Firestore...' : 'Live Connected'}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by Product name, SKU ID, or Color..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-neutral-900 pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white text-neutral-900 pl-4 pr-10 py-2.5 border border-neutral-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 appearance-none"
          >
            <option value="all">All Categories</option>
            <option value="women">Women</option>
            <option value="men">Men</option>
            <option value="accessories">Accessories</option>
            <option value="unisex">Unisex</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>

        {/* Stock Status Filter */}
        <div className="relative">
          <select
            value={selectedStockStatus}
            onChange={(e) => setSelectedStockStatus(e.target.value)}
            className="w-full bg-white text-neutral-900 pl-4 pr-10 py-2.5 border border-neutral-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 appearance-none"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in">In Stock (&gt; 5)</option>
            <option value="low">Low Stock (1 - 5)</option>
            <option value="out">Out of Stock (0)</option>
          </select>
          <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>
      </div>

      {/* SKUs List Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-neutral-900 animate-spin" />
            <p className="text-sm text-neutral-500">Loading catalog from Firestore...</p>
          </div>
        ) : filteredSKUs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-neutral-500 font-medium">No matching SKU combinations found.</p>
            <p className="text-xs text-neutral-400 mt-1">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Product Image</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Product Title</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">SKU ID</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Color</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Size</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Stock Level</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-neutral-500 uppercase tracking-wider">Update Qty</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-100">
                {filteredSKUs.map((row) => {
                  const currentStockVal = editingStock[row.skuId] !== undefined ? editingStock[row.skuId] : row.stock;
                  const isModified = editingStock[row.skuId] !== undefined && editingStock[row.skuId] !== row.stock;
                  const isSaving = savingSku === row.skuId;
                  const isSuccess = saveSuccessSku === row.skuId;

                  return (
                    <tr 
                      key={row.skuId} 
                      className={`hover:bg-neutral-50/50 transition-colors ${isSuccess ? 'bg-emerald-50/40 hover:bg-emerald-50/40' : ''}`}
                    >
                      {/* Product Image */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative w-12 h-16 rounded overflow-hidden bg-neutral-100 border border-neutral-200">
                          <Image
                            src={row.image || "/hero.png"}
                            alt={row.productTitle}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      </td>

                      {/* Product Title */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-neutral-900 font-serif line-clamp-1">{row.productTitle}</div>
                        <div className="text-xs text-neutral-400 mt-0.5 font-mono">id: {row.productId}</div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-200">
                          {row.category}
                        </span>
                      </td>

                      {/* SKU ID */}
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-semibold text-neutral-800">
                        {row.skuId}
                      </td>

                      {/* Color */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                        <div className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-inner flex-shrink-0" style={{ backgroundColor: row.color.startsWith('#') ? row.color : '#CCCCCC' }} />
                          {row.color}
                        </div>
                      </td>

                      {/* Size */}
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-sm text-neutral-800">
                        {row.size}
                      </td>

                      {/* Stock Level Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStockBadge(row.stock)}
                      </td>

                      {/* Update Qty actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="inline-flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={currentStockVal}
                            disabled={isSaving}
                            onChange={(e) => handleStockChange(row.skuId, e.target.value)}
                            className="w-20 bg-white text-neutral-900 text-center py-1.5 border border-neutral-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 disabled:opacity-50"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveStock(row.productId, row.skuId)}
                            disabled={!isModified || isSaving}
                            className={`p-2 rounded-md border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-neutral-900 ${
                              isSuccess 
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' 
                                : isModified
                                  ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-900 text-white shadow-md cursor-pointer'
                                  : 'bg-white border-neutral-200 text-neutral-300 cursor-not-allowed'
                            }`}
                            title="Save changes"
                          >
                            {isSaving ? (
                              <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
                            ) : isSuccess ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Save className="w-4 h-4" />
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
        )}
      </div>
    </div>
  );
}
