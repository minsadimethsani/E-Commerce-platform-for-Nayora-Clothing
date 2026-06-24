import { getAdminProductById } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Tag, DollarSign, Archive, Clock, RefreshCw } from "lucide-react";
import { getAllCategories } from "@/lib/category-db";
import EditProductModal from "../components/EditProductModal";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();

  if (session?.role !== "super_admin" && !session?.privileges?.includes("manage_products")) {
    redirect("/admin");
  }

  const product = await getAdminProductById(id);
  const categories = await getAllCategories();

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 bg-white border border-neutral-100 rounded-xl shadow-sm">
        <h2 className="text-2xl font-serif text-neutral-800 mb-4">Product Not Found</h2>
        <p className="text-neutral-500 mb-6 text-sm">The product with ID "{id}" could not be located in the database.</p>
        <Link 
          href="/admin/products"
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section with back navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link 
            href="/admin/products"
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Manage Products
          </Link>
          <h1 className="text-3xl font-serif text-neutral-900">{product.name}</h1>
          <p className="text-xs text-neutral-400 mt-1 font-mono">Product ID: {product.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <EditProductModal product={product} categories={categories} />
        </div>
      </div>

      {/* Main product details block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Product Image & Quick Status */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-neutral-50 border border-neutral-200/50 flex items-center justify-center">
              <img 
                src={product.image || "/hero.png"} 
                alt={product.name} 
                className="w-full h-full object-cover object-center" 
              />
            </div>
            {product.tag && (
              <div className="mt-4 flex justify-center">
                <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-full uppercase tracking-wider">
                  {product.tag}
                </span>
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-neutral-50 rounded-lg text-neutral-700">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-neutral-400 block font-medium">Price</span>
              <span className="text-sm font-bold text-neutral-800">LKR {product.price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right: Technical Information & Description */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Metadata Card */}
          <div className="bg-white p-6 rounded-xl border border-neutral-100 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-neutral-500" /> General Specifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div>
                <span className="text-xs text-neutral-400 block mb-1">Category</span>
                <span className="font-semibold text-neutral-800 capitalize">{product.category || "N/A"}</span>
              </div>
              <div>
                <span className="text-xs text-neutral-400 block mb-1">Subcategory</span>
                <span className="font-semibold text-neutral-800 capitalize">{product.subCategory || "None"}</span>
              </div>
              <div>
                <span className="text-xs text-neutral-400 block mb-1">Available Colours</span>
                <span className="font-semibold text-neutral-800 capitalize">
                  {product.variants && product.variants.length > 0
                    ? Array.from(new Set(product.variants.map(v => v.color))).filter(c => c && c.toLowerCase() !== "default").join(", ") || product.color || "Default"
                    : product.color || "Default"}
                </span>
              </div>
              <div>
                <span className="text-xs text-neutral-400 block mb-1">Available Sizes</span>
                <span className="font-semibold text-neutral-800">
                  {product.variants && product.variants.length > 0
                    ? Array.from(new Set(product.variants.map(v => v.size))).join(", ")
                    : "S"}
                </span>
              </div>
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-white p-6 rounded-xl border border-neutral-100 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-100 pb-2">Description</h2>
            <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
              {product.description || "No description provided for this product."}
            </p>
          </div>

          {/* Timestamps */}
          <div className="flex flex-wrap gap-4 text-xs text-neutral-400 bg-neutral-50 p-4 rounded-lg">
            {product.createdAt && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Created: {new Date(product.createdAt).toLocaleString()}</span>
              </div>
            )}
            {product.updatedAt && (
              <div className="flex items-center gap-1.5 ml-auto">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Last Updated: {new Date(product.updatedAt).toLocaleString()}</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
