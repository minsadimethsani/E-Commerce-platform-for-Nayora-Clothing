"use client";

import { Edit, Trash2 } from "lucide-react";
import { AdminProduct } from "@/lib/db";
import { deleteProductAction } from "../actions";
import { useTransition } from "react";

export default function ProductsTable({ products }: { products: AdminProduct[] }) {
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Quantity</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {products.map((product) => (
              <tr key={product.id} className={`transition-colors hover:bg-neutral-50 ${isPending ? 'opacity-70' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 bg-neutral-100 rounded-md overflow-hidden">
                      <img className="h-10 w-10 object-cover" src={product.image} alt={product.name} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-neutral-900">{product.name}</div>
                      <div className="text-sm text-neutral-500 capitalize">{product.category} {product.subCategory && `- ${product.subCategory}`}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-900">${product.price.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-900">{product.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.quantity > 10 ? 'bg-green-100 text-green-800' : 
                    product.quantity > 0 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.quantity > 10 ? 'In Stock' : product.quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-neutral-500 hover:text-neutral-900 mr-4 transition-colors" disabled={isPending}>
                    <Edit className="w-4 h-4" />
                    <span className="sr-only">Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    disabled={isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">Remove</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
