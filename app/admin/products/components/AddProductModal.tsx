"use client";

import { useActionState, useEffect, useState, startTransition } from "react";
import { Plus, X, AlertCircle, CheckCircle2, UploadCloud } from "lucide-react";
import { createProductAction } from "../actions";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const initialState = {
  success: false,
  message: "",
  errors: {} as Record<string, string>,
};

function AddProductModalContent({ onClose }: { onClose: () => void }) {
  const [state, formAction, isPendingAction] = useActionState(createProductAction, initialState);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const isPending = isPendingAction || isUploading;

  // Close modal on success
  useEffect(() => {
    if (state.success) {
      const t = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [state.success, onClose]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const urls = Array.from(files).map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    } else {
      setPreviewUrls([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const fileInput = form.querySelector('input[name="imageFile"]') as HTMLInputElement;
    const files = fileInput?.files;

    if (!files || files.length === 0) {
      startTransition(() => formAction(formData));
      return;
    }

    try {
      setIsUploading(true);
      const uploadPromises = Array.from(files).map(async (file) => {
        const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
        const storageRef = ref(storage, `products/${uniqueName}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      });

      const downloadURLs = await Promise.all(uploadPromises);
      
      if (downloadURLs.length > 0) {
        formData.set("image", downloadURLs[0]);
        formData.set("images", JSON.stringify(downloadURLs));
      }
      
      formData.delete("imageFile"); // Prevent Next.js from processing the file unnecessarily

      startTransition(() => {
        formAction(formData);
      });
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image(s). Please try again.");
    } finally {
      setIsUploading(false);
    }
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

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative z-10">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-8 sm:pb-6">
            <div className="flex justify-between items-center mb-6 border-b border-neutral-100 pb-4">
              <h3 className="text-xl leading-6 font-serif text-neutral-900" id="modal-title">
                Add New Product
              </h3>
              <button 
                onClick={() => !isPending && onClose()}
                className="text-neutral-400 hover:text-neutral-500 transition-colors rounded-full p-1 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {state.message && (
              <div className={`mb-6 p-4 rounded-md flex items-center ${state.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {state.success ? <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />}
                <p className="text-sm font-medium">{state.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className={state.success ? 'opacity-50 pointer-events-none' : ''}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                {/* Column 1 */}
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-700">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      minLength={3}
                      placeholder="e.g. Silk Evening Gown"
                      className={`bg-white text-neutral-900 mt-1 block w-full shadow-sm sm:text-sm rounded-md py-2 px-3 border focus:outline-none focus:ring-2 focus:ring-offset-1 ${state.errors?.name ? 'border-red-300 text-red-900 focus:ring-red-500' : 'border-neutral-300 focus:ring-neutral-900 focus:border-neutral-900'}`}
                    />
                    {state.errors?.name && <p className="mt-1 text-xs text-red-600">{state.errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-neutral-700">Category *</label>
                    <select
                      id="category"
                      name="category"
                      defaultValue="women"
                      className="bg-white text-neutral-900 mt-1 block w-full shadow-sm sm:text-sm rounded-md py-2 px-3 border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-neutral-900 focus:border-neutral-900"
                    >
                      <option value="women">Women</option>
                      <option value="men">Men</option>
                      <option value="accessories">Accessories</option>
                      <option value="unisex">Unisex</option>
                    </select>
                    {state.errors?.category && <p className="mt-1 text-xs text-red-600">{state.errors.category}</p>}
                  </div>

                  <div>
                    <label htmlFor="subCategory" className="block text-sm font-medium text-neutral-700">Sub Category</label>
                    <select
                      id="subCategory"
                      name="subCategory"
                      defaultValue=""
                      className="bg-white text-neutral-900 mt-1 block w-full shadow-sm sm:text-sm rounded-md py-2 px-3 border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-neutral-900 focus:border-neutral-900"
                    >
                      <option value="">None / Select</option>
                      <option value="formal">Formal</option>
                      <option value="casual">Casual</option>
                      <option value="loungewear">Loungewear</option>
                      <option value="partywear">Partywear</option>
                      <option value="bags">Bags</option>
                      <option value="eyewear">Eyewear</option>
                      <option value="jewelry">Jewelry</option>
                      <option value="accents">Accents</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="imageFile" className="block text-sm font-medium text-neutral-700">Product Image(s) *</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-md hover:border-neutral-400 transition-colors bg-neutral-50 relative group overflow-hidden">
                      {previewUrls.length > 0 ? (
                        <div className="absolute inset-0 w-full h-full p-2 bg-white flex gap-2 overflow-x-auto items-center">
                          {previewUrls.map((url, i) => (
                            <img key={i} src={url} alt={`Preview ${i}`} className="h-full max-w-[120px] object-cover rounded shadow-sm flex-shrink-0" />
                          ))}
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                             <label htmlFor="imageFile" className="cursor-pointer bg-white text-neutral-900 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm">
                               Change Images
                             </label>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1 text-center py-4">
                          <UploadCloud className="mx-auto h-10 w-10 text-neutral-400 group-hover:text-neutral-500 mb-3" />
                          <div className="flex text-sm text-neutral-600 justify-center">
                            <label
                              htmlFor="imageFile"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-neutral-900 hover:text-neutral-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-neutral-900 px-3 py-1.5 shadow-sm border border-neutral-200"
                            >
                              <span>Upload files</span>
                            </label>
                          </div>
                          <p className="text-xs text-neutral-500 mt-2">Select multiple images (PNG, JPG, GIF up to 5MB each)</p>
                        </div>
                      )}
                      <input id="imageFile" name="imageFile" type="file" accept="image/*" multiple className="sr-only" onChange={handleImageChange} required />
                    </div>
                    {state.errors?.image && <p className="mt-1 text-xs text-red-600">{state.errors.image}</p>}
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-neutral-700">Price ($) *</label>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className={`bg-white text-neutral-900 mt-1 block w-full shadow-sm sm:text-sm rounded-md py-2 px-3 border focus:outline-none focus:ring-2 focus:ring-offset-1 ${state.errors?.price ? 'border-red-300 text-red-900 focus:ring-red-500' : 'border-neutral-300 focus:ring-neutral-900 focus:border-neutral-900'}`}
                      />
                      {state.errors?.price && <p className="mt-1 text-xs text-red-600">{state.errors.price}</p>}
                    </div>
                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium text-neutral-700">Quantity *</label>
                      <input
                        type="number"
                        name="quantity"
                        id="quantity"
                        required
                        min="0"
                        placeholder="10"
                        className={`bg-white text-neutral-900 mt-1 block w-full shadow-sm sm:text-sm rounded-md py-2 px-3 border focus:outline-none focus:ring-2 focus:ring-offset-1 ${state.errors?.quantity ? 'border-red-300 text-red-900 focus:ring-red-500' : 'border-neutral-300 focus:ring-neutral-900 focus:border-neutral-900'}`}
                      />
                      {state.errors?.quantity && <p className="mt-1 text-xs text-red-600">{state.errors.quantity}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="color" className="block text-sm font-medium text-neutral-700">Color</label>
                    <input
                      type="text"
                      name="color"
                      id="color"
                      placeholder="e.g. Espresso, Cream"
                      className="bg-white text-neutral-900 mt-1 block w-full shadow-sm sm:text-sm border-neutral-300 rounded-md py-2 px-3 border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-neutral-900 focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="tag" className="block text-sm font-medium text-neutral-700">Tag / Badge</label>
                    <select
                      id="tag"
                      name="tag"
                      defaultValue=""
                      className="bg-white text-neutral-900 mt-1 block w-full shadow-sm sm:text-sm rounded-md py-2 px-3 border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-neutral-900 focus:border-neutral-900"
                    >
                      <option value="">No Tag</option>
                      <option value="Best Seller">Best Seller</option>
                      <option value="Just Added">Just Added</option>
                      <option value="Editor's Pick">Editor's Pick</option>
                      <option value="Limited Run">Limited Run</option>
                      <option value="Exclusive">Exclusive</option>
                      <option value="Selling Fast">Selling Fast</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-neutral-100 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={isPending || state.success}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-2.5 bg-neutral-900 text-base font-medium text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-70"
                >
                  {isPending ? 'Saving...' : 'Save Product'}
                </button>
                <button
                  type="button"
                  onClick={() => !isPending && onClose()}
                  disabled={isPending || state.success}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-neutral-300 shadow-sm px-6 py-2.5 bg-white text-base font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors disabled:opacity-70"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AddProductModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900"
      >
        <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
        Add New Product
      </button>

      {isOpen && <AddProductModalContent onClose={() => setIsOpen(false)} />}
    </>
  );
}
