"use client";

import { Trash2, Eye } from "lucide-react";
import { AdminProduct } from "@/lib/db";
import { deleteProductAction } from "../actions";
import { useTransition } from "react";
import { Category } from "@/lib/category-db";
import EditProductModal from "./EditProductModal";
import Link from "next/link";

export default function ProductsTable({ products, categories }: { products: AdminProduct[]; categories: Category[] }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string | number) => {
    startTransition(() => {
      deleteProductAction(id);
    });
  };

  if (products.length === 0) {
    return (
      <div className="bg-white border border-neutral-100 rounded-xl shadow-sm p-12 text-center text-neutral-500">
        No products found.
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-100 rounded-xl shadow-sm overflow-hidden mb-8">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Product</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Price</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Colours</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Sizes</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {products.map((product: AdminProduct) => {
              const productColors = product.variants && product.variants.length > 0
                ? Array.from(new Set(product.variants.map(v => v.color))).filter(c => c && c.toLowerCase() !== "default").join(", ") || product.color || "Default"
                : product.color || "Default";

              const productSizes = product.variants && product.variants.length > 0
                ? Array.from(new Set(product.variants.map(v => v.size))).join(", ")
                : "S";

              return (
                <tr key={product.id} className={`transition-colors hover:bg-neutral-50 ${isPending ? 'opacity-70' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Link href={`/admin/products/${product.id}`} className="h-10 w-10 flex-shrink-0 bg-neutral-100 rounded-md overflow-hidden hover:opacity-80 transition-opacity">
                        <img className="h-10 w-10 object-cover" src={product.image} alt={product.name} />
                      </Link>
                      <div className="ml-4">
                        <Link href={`/admin/products/${product.id}`} className="text-sm font-medium text-neutral-900 hover:text-olive transition-colors hover:underline">{product.name}</Link>
                        <div className="text-sm text-neutral-500 capitalize">{product.category} {product.subCategory && `- ${product.subCategory}`}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900">LKR {product.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 capitalize">
                    {productColors}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                    {productSizes}
                  </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <Link 
                    href={`/admin/products/${product.id}`} 
                    className="text-neutral-400 hover:text-neutral-600 transition-colors inline-flex items-center justify-center p-1"
                    title="View Detail"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <EditProductModal product={product} categories={categories} />
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="text-red-500 hover:text-red-700 transition-colors inline-flex items-center justify-center p-1"
                    disabled={isPending}
                    title="Remove Product"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">Remove</span>
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}
