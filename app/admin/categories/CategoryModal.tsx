"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { Plus, X, AlertCircle, CheckCircle2, Tag } from "lucide-react";
import { createCategoryAction, updateCategoryAction } from "./actions";
import { Category } from "@/lib/category-db";

type State = {
  error?: string;
  success?: boolean;
  message?: string;
};

const initialState: State = {
  error: "",
  success: false,
  message: "",
};

function CategoryModalContent({ onClose, category }: { onClose: () => void; category?: Category }) {
  const isEditing = !!category;
  const action = isEditing ? updateCategoryAction.bind(null, category.id!) : createCategoryAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  
  const [subCategories, setSubCategories] = useState<string[]>(category?.subCategories || []);
  const [subCatInput, setSubCatInput] = useState("");

  const handleAddSubCategory = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    const val = subCatInput.trim().toLowerCase();
    if (val && !subCategories.includes(val)) {
      setSubCategories([...subCategories, val]);
    }
    setSubCatInput("");
  };

  const handleRemoveSubCategory = (sub: string) => {
    setSubCategories(subCategories.filter(s => s !== sub));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-neutral-900 bg-opacity-50 transition-opacity backdrop-blur-sm" 
          aria-hidden="true"
          onClick={() => !isPending && onClose()}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full relative z-10 font-sans">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-8 sm:pb-6">
            <div className="flex justify-between items-center mb-6 border-b border-neutral-100 pb-4">
              <h3 className="text-xl leading-6 font-serif text-neutral-900 flex items-center gap-2" id="modal-title">
                <Tag className="w-5 h-5 text-neutral-700" />
                {isEditing ? "Edit Category" : "Create Product Category"}
              </h3>
              <button 
                onClick={() => !isPending && onClose()}
                className="text-neutral-400 hover:text-neutral-500 transition-colors rounded-full p-1 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {state?.success ? (
              <div className="mb-6 p-6 rounded-md bg-green-50 border border-green-200">
                <div className="flex items-start">
                  <CheckCircle2 className="w-6 h-6 mr-3 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-lg font-medium text-green-900 mb-2">Category Saved!</h4>
                    <p className="text-sm text-green-800">{state.message}</p>
                  </div>
                </div>
                <div className="mt-6 text-right">
                  <button onClick={onClose} className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors">
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form action={formAction}>
                {state?.error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-md text-sm flex items-center border border-red-200">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    {state.error}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-700">Category Name *</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      defaultValue={category?.name || ""}
                      placeholder="e.g. Footwear, Loungewear"
                      className="mt-1 block w-full bg-white border border-neutral-300 rounded-md py-2.5 px-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#8C7162] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Subcategories</label>
                    <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-4">
                      {/* Subcategory List builder input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type subcategory name (e.g. casual)"
                          value={subCatInput}
                          onChange={(e) => setSubCatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAddSubCategory(e);
                            }
                          }}
                          className="flex-1 bg-white border border-neutral-300 rounded-md py-1.5 px-3 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#8C7162] text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleAddSubCategory}
                          className="px-4 py-1.5 bg-neutral-900 text-white rounded-md text-xs font-semibold hover:bg-neutral-800 transition-colors"
                        >
                          Add
                        </button>
                      </div>

                      {/* Display added subcategories chips */}
                      {subCategories.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-200">
                          {subCategories.map((sub, index) => (
                            <span key={index} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white border border-neutral-300 shadow-sm text-neutral-800 capitalize">
                              {sub}
                              <button
                                type="button"
                                onClick={() => handleRemoveSubCategory(sub)}
                                className="text-neutral-400 hover:text-red-500 transition-colors ml-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              {/* Hidden input to submit with the form action */}
                              <input type="hidden" name="subCategories" value={sub} />
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-400 italic text-center py-2">No subcategories added yet.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-neutral-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => !isPending && onClose()}
                    disabled={isPending}
                    className="px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-70"
                  >
                    {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Category"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoryModal({ category, trigger }: { category?: Category; trigger?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)} className="inline-block">
          {trigger}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Category
        </button>
      )}

      {isOpen && <CategoryModalContent onClose={() => setIsOpen(false)} category={category} />}
    </>
  );
}
