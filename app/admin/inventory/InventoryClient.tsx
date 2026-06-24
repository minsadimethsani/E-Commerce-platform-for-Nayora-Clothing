"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Loader2, 
  ArrowUpDown, 
  AlertTriangle,
  RefreshCw,
  Eye
} from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/data/cloths";

interface GroupedProductRow {
  id: string;
  name: string;
  image: string;
  category: string;
  totalStock: number;
}

export default function InventoryClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStockStatus, setSelectedStockStatus] = useState("all");

  // Subscribe to real-time updates from products collection
  useEffect(() => {
    const productsRef = collection(db, "products");
    const unsubscribe = onSnapshot(
      productsRef,
      (snapshot) => {
        const loadedProducts: Product[] = snapshot.docs.map((doc) => {
          const data = doc.data();
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

  // Group inventory rows by product (summing stock of variants)
  const getProductRows = (): GroupedProductRow[] => {
    return products.map((p) => {
      const totalStock = p.variants && p.variants.length > 0
        ? p.variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0)
        : ((p as any).quantity !== undefined ? (p as any).quantity : 0);

      return {
        id: String(p.id),
        name: p.name,
        image: p.image,
        category: p.category,
        totalStock: totalStock
      };
    });
  };

  const productRows = getProductRows();

  // Filter products
  const filteredProducts = productRows.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "all" || 
      p.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesStock = 
      selectedStockStatus === "all" ||
      (selectedStockStatus === "out" && p.totalStock === 0) ||
      (selectedStockStatus === "low" && p.totalStock >= 1 && p.totalStock <= 5) ||
      (selectedStockStatus === "in" && p.totalStock > 5);

    return matchesSearch && matchesCategory && matchesStock;
  });

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
          <p className="text-sm text-neutral-500 mt-1 font-sans">
            Monitor total stock quantity and status for each product. Click "Manage Stock" to view and update detailed variant-level quantities.
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
            placeholder="Search by Product name or Product ID..."
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

      {/* Products Inventory List Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-neutral-900 animate-spin" />
            <p className="text-sm text-neutral-500">Loading catalog from Firestore...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-neutral-500 font-medium">No matching products found.</p>
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
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Stock</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Stock Status</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-100">
                {filteredProducts.map((row) => {
                  return (
                    <tr 
                      key={row.id} 
                      className="hover:bg-neutral-50/50 transition-colors"
                    >
                      {/* Product Image */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative w-12 h-16 rounded overflow-hidden bg-neutral-100 border border-neutral-200">
                          <Image
                            src={row.image || "/hero.png"}
                            alt={row.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      </td>

                      {/* Product Title */}
                      <td className="px-6 py-4">
                        <Link href={`/admin/inventory/${row.id}`} className="text-sm font-semibold text-neutral-900 font-serif hover:text-olive transition-colors hover:underline">
                          {row.name}
                        </Link>
                        <div className="text-xs text-neutral-400 mt-0.5 font-mono">ID: {row.id}</div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-200">
                          {row.category}
                        </span>
                      </td>

                      {/* Total Stock */}
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-sm text-neutral-800">
                        {row.totalStock} units
                      </td>

                      {/* Stock Status Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStockBadge(row.totalStock)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/inventory/${row.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" /> Manage Stock
                        </Link>
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
