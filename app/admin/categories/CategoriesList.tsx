"use client";

import { useTransition, useState } from "react";
import { Edit2, Trash2, Tag, AlertTriangle } from "lucide-react";
import { Category } from "@/lib/category-db";
import { deleteCategoryAction } from "./actions";
import CategoryModal from "./CategoryModal";

export default function CategoriesList({ categories }: { categories: Category[] }) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the category "${name}"?\nNote: Deleting a category will not delete products assigned to it, but may break storefront filtering unless products are updated.`)) return;

    setErrorMsg(null);
    startTransition(async () => {
      const res = await deleteCategoryAction(id);
      if (res && res.error) {
        setErrorMsg(res.error);
      }
    });
  };

  if (categories.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-12 text-center text-neutral-500 font-sans">
        <Tag className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900">No Categories Found</h3>
        <p className="text-sm text-neutral-500 mt-2">
          Create product categories and subcategories to construct your shop catalog structure.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm flex items-center shadow-sm">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
          <div>{errorMsg}</div>
        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden font-sans">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr className="text-neutral-500 text-xs uppercase tracking-widest font-semibold">
                <th scope="col" className="px-6 py-4 text-left">Category Name</th>
                <th scope="col" className="px-6 py-4 text-left">Route Slug</th>
                <th scope="col" className="px-6 py-4 text-left">Subcategories</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100">
              {categories.map((category) => (
                <tr key={category.id} className={`transition-colors hover:bg-neutral-50 ${isPending ? 'opacity-70' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-[#FAF9F6] border border-[#2C241E]/10 text-[#2C241E] flex items-center justify-center font-bold">
                        <Tag className="w-4 h-4" />
                      </div>
                      <span className="ml-3 font-semibold text-neutral-900">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 font-mono">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {category.subCategories && category.subCategories.length > 0 ? (
                        category.subCategories.map((sub) => (
                          <span
                            key={sub}
                            className="px-2.5 py-1 bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-medium rounded-md capitalize"
                          >
                            {sub}
                          </span>
                        ))
                      ) : (
                        <span className="text-neutral-400 italic text-xs">No subcategories defined</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <CategoryModal
                        category={category}
                        trigger={
                          <button
                            type="button"
                            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-all cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        }
                      />
                      <button
                        onClick={() => category.id && handleDelete(category.id, category.name)}
                        className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-all cursor-pointer"
                        disabled={isPending}
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
