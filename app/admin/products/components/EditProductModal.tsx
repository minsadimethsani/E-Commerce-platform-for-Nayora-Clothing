"use client";

import { useActionState, useEffect, useState, startTransition, useRef } from "react";
import { X, AlertCircle, CheckCircle2, UploadCloud, Trash2, Edit } from "lucide-react";
import { updateProductAction } from "../actions";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { AdminProduct } from "@/lib/db";

const initialState = {
  success: false,
  message: "",
  errors: {} as Record<string, string>,
};

interface EditProductModalContentProps {
  product: AdminProduct;
  onClose: () => void;
}

function EditProductModalContent({ product, onClose }: EditProductModalContentProps) {
  // Bind product.id to the action
  const updateProductWithId = updateProductAction.bind(null, product.id);
  const [state, formAction, isPendingAction] = useActionState(updateProductWithId, initialState);
  
  const [isUploading, setIsUploading] = useState(false);
  
  // States for new file uploads
  const [generalFiles, setGeneralFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [colorFiles, setColorFiles] = useState<Record<string, File[]>>({});
  const [colorPreviews, setColorPreviews] = useState<Record<string, string[]>>({});

  // States for existing images from database
  const [existingGeneralUrls, setExistingGeneralUrls] = useState<string[]>(() => {
    const hasColorImages = product.colorImages && Object.keys(product.colorImages).length > 0;
    return !hasColorImages ? (product.images || [product.image].filter(Boolean)) : [];
  });
  const [existingColorUrls, setExistingColorUrls] = useState<Record<string, string[]>>(() => {
    return product.colorImages || {};
  });

  // Client states for attributes
  const [selectedColors, setSelectedColors] = useState<string[]>(() => {
    const hasVariants = product.variants && product.variants.length > 0;
    if (hasVariants) {
      return Array.from(
        new Set(
          product.variants!
            .map(v => v.color)
            .filter(c => c && c.toLowerCase() !== "default")
        )
      );
    }
    if (product.colorImages && Object.keys(product.colorImages).length > 0) {
      return Object.keys(product.colorImages).filter(c => c.toLowerCase() !== "default");
    }
    if (product.color && product.color.toLowerCase() !== "default") {
      return [product.color];
    }
    return [];
  });

  const [selectedSizes, setSelectedSizes] = useState<Array<string | number>>(() => {
    const hasVariants = product.variants && product.variants.length > 0;
    if (hasVariants) {
      return Array.from(new Set(product.variants!.map(v => v.size).filter(s => s !== undefined)));
    }
    return [];
  });

  const [combinationStocks, setCombinationStocks] = useState<Record<string, number>>(() => {
    const initialStocks: Record<string, number> = {};
    if (product.variants) {
      product.variants.forEach(v => {
        initialStocks[`${v.color}-${v.size}`] = v.stock_quantity;
      });
    }
    return initialStocks;
  });

  const [baseStock, setBaseStock] = useState<number>(product.quantity || 0);
  const [baseColor, setBaseColor] = useState<string>(product.color && product.color.toLowerCase() !== "default" ? product.color : "");
  
  const [sizeSystemType, setSizeSystemType] = useState<"standard" | "numeric">(() => {
    const hasVariants = product.variants && product.variants.length > 0;
    if (hasVariants) {
      const sizes = product.variants!.map(v => v.size);
      if (sizes.some(s => typeof s === 'number' || (typeof s === 'string' && /^\d+$/.test(s)))) {
        return "numeric";
      }
    }
    return "standard";
  });

  const [deletedCombinations, setDeletedCombinations] = useState<string[]>([]);
  const [customColorInput, setCustomColorInput] = useState("");
  const [customSizeInput, setCustomSizeInput] = useState("");

  const addColor = (colorName: string) => {
    const trimmed = colorName.trim();
    if (trimmed && !selectedColors.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedColors([...selectedColors, trimmed]);
    }
  };

  const removeColor = (colorName: string) => {
    setSelectedColors(selectedColors.filter(c => c !== colorName));
    
    // Clear files/previews for this color
    setColorFiles(prev => {
      const copy = { ...prev };
      delete copy[colorName];
      return copy;
    });
    setColorPreviews(prev => {
      const copy = { ...prev };
      if (copy[colorName]) {
        copy[colorName].forEach(url => URL.revokeObjectURL(url));
      }
      delete copy[colorName];
      return copy;
    });
    
    // Clear existing image records for this color
    setExistingColorUrls(prev => {
      const copy = { ...prev };
      delete copy[colorName];
      return copy;
    });
  };

  const removeSize = (size: string | number) => {
    setSelectedSizes(selectedSizes.filter(s => s !== size));
  };

  const [featuredColors, setFeaturedColors] = useState<Array<{ name: string; hex: string }>>([
    { name: "Cream", hex: "#F5F2EB" },
    { name: "Espresso", hex: "#2C241E" },
    { name: "Olive", hex: "#556B2F" },
    { name: "Beaver", hex: "#9F8170" },
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Navy", hex: "#1D2A44" },
    { name: "Gold", hex: "#D4AF37" }
  ]);

  const addCustomColor = (hex: string) => {
    if (!featuredColors.some(c => c.hex.toLowerCase() === hex.toLowerCase())) {
      setFeaturedColors([...featuredColors, { name: hex.toUpperCase(), hex }]);
    }
  };
  
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

  // General Image handlers
  const handleGeneralImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files);
      setGeneralFiles(prev => [...prev, ...fileList]);
      const urls = fileList.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...urls]);
    }
  };

  const removeGeneralImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingGeneralUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      setGeneralFiles(prev => prev.filter((_, i) => i !== index));
      setPreviewUrls(prev => {
        URL.revokeObjectURL(prev[index]);
        return prev.filter((_, i) => i !== index);
      });
    }
  };

  // Color specific image handlers
  const handleColorImagesChange = (colorName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files);
      setColorFiles(prev => {
        const existing = prev[colorName] || [];
        return { ...prev, [colorName]: [...existing, ...fileList] };
      });
      setColorPreviews(prev => {
        const existing = prev[colorName] || [];
        const urls = fileList.map(file => URL.createObjectURL(file));
        return { ...prev, [colorName]: [...existing, ...urls] };
      });
    }
  };

  const removeColorImage = (colorName: string, index: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingColorUrls(prev => {
        const existing = prev[colorName] || [];
        return { ...prev, [colorName]: existing.filter((_, i) => i !== index) };
      });
    } else {
      setColorFiles(prev => {
        const existing = prev[colorName] || [];
        return { ...prev, [colorName]: existing.filter((_, i) => i !== index) };
      });
      setColorPreviews(prev => {
        const existing = prev[colorName] || [];
        URL.revokeObjectURL(existing[index]);
        return { ...prev, [colorName]: existing.filter((_, i) => i !== index) };
      });
    }
  };

  // Helper to determine combinations
  const getCombinations = () => {
    if (selectedColors.length > 0 && selectedSizes.length > 0) {
      return selectedColors.flatMap(color => 
        selectedSizes.map(size => ({ color, size }))
      );
    } else if (selectedColors.length > 0) {
      return selectedColors.map(color => ({ color, size: "S" }));
    } else if (selectedSizes.length > 0) {
      return selectedSizes.map(size => ({ color: "Default", size }));
    }
    return [];
  };

  const getFilteredCombinations = () => {
    return getCombinations().filter(
      comb => !deletedCombinations.includes(`${comb.color}-${comb.size}`)
    );
  };

  const uniqueColors = selectedColors;

  const computedVariants = getFilteredCombinations().map(comb => ({
    color: comb.color,
    size: comb.size,
    stock_quantity: combinationStocks[`${comb.color}-${comb.size}`] || 0
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;

    const totalGeneralPreviewsCount = existingGeneralUrls.length + generalFiles.length;
    const totalColorPreviewsCount = Object.values(existingColorUrls).flat().length + Object.values(colorFiles).flat().length;

    // Validate that if there are unique colors, each has at least one image uploaded
    if (uniqueColors.length > 0) {
      const missingImages = uniqueColors.filter(color => {
        const hasExisting = existingColorUrls[color] && existingColorUrls[color].length > 0;
        const hasNew = colorFiles[color] && colorFiles[color].length > 0;
        return !hasExisting && !hasNew;
      });
      if (missingImages.length > 0) {
        alert(`Please upload or retain at least one image for each color variant. Missing image for: ${missingImages.join(", ")}`);
        return;
      }
    } else {
      // Validate that at least one image remains or is uploaded
      if (totalGeneralPreviewsCount === 0) {
        alert("Please upload at least one product image.");
        return;
      }
    }
    
    const form = e.currentTarget;
    const formData = new FormData(form);

    const totalQuantity = computedVariants.length > 0
      ? computedVariants.reduce((sum, v) => sum + v.stock_quantity, 0)
      : baseStock;

    const finalColor = selectedColors.length > 0
      ? selectedColors[0]
      : (baseColor.trim() || "Default");

    // Populate calculated fields in form data
    formData.set("variants", JSON.stringify(computedVariants));
    formData.set("quantity", String(totalQuantity));
    formData.set("color", finalColor);

    try {
      setIsUploading(true);
      
      // 1. Upload new color variant images and merge with existing ones
      const finalColorImages: Record<string, string[]> = {};
      if (uniqueColors.length > 0) {
        for (const color of uniqueColors) {
          const newFilesForColor = colorFiles[color] || [];
          const existingUrls = existingColorUrls[color] || [];
          const uploadedUrls: string[] = [];
          
          for (const file of newFilesForColor) {
            const uniqueName = `color-${color.replace(/[^a-zA-Z0-9.-]/g, "")}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
            const storageRef = ref(storage, `products/${uniqueName}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            uploadedUrls.push(url);
          }
          finalColorImages[color] = [...existingUrls, ...uploadedUrls];
        }
        formData.set("colorImages", JSON.stringify(finalColorImages));
      }

      // 2. Upload new general images and merge with existing ones
      let finalGeneralImages: string[] = [];
      if (uniqueColors.length === 0) {
        const uploadPromises = generalFiles.map(async (file) => {
          const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
          const storageRef = ref(storage, `products/${uniqueName}`);
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        });
        const newUrls = await Promise.all(uploadPromises);
        finalGeneralImages = [...existingGeneralUrls, ...newUrls];
      }

      // Set images array and primary image
      if (uniqueColors.length === 0 && finalGeneralImages.length > 0) {
        formData.set("image", finalGeneralImages[0]);
        formData.set("images", JSON.stringify(finalGeneralImages));
      } else if (Object.keys(finalColorImages).length > 0) {
        const firstUrl = Object.values(finalColorImages)[0]?.[0] || "/hero.png";
        const allUrls = Object.values(finalColorImages).flat();
        formData.set("image", firstUrl);
        formData.set("images", JSON.stringify(allUrls));
      }
      
      formData.delete("imageFile"); // Prevent Next.js from processing raw files

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
                Edit Product
              </h3>
              <button 
                onClick={() => !isPending && onClose()}
                className="text-neutral-400 hover:text-neutral-500 transition-colors rounded-full p-1 hover:bg-neutral-100 cursor-pointer"
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
                      defaultValue={product.name}
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
                      defaultValue={product.category}
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
                      defaultValue={product.subCategory || ""}
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

                  {uniqueColors.length === 0 && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700">Product Image(s) *</label>
                      <div className="mt-1 space-y-4">
                        {(existingGeneralUrls.length > 0 || previewUrls.length > 0) && (
                          <div className="grid grid-cols-3 gap-2 p-2 bg-neutral-50 border border-neutral-200 rounded-md">
                            {/* Existing general image previews */}
                            {existingGeneralUrls.map((url, i) => (
                              <div key={`existing-${i}`} className="relative aspect-square w-full rounded overflow-hidden bg-white border border-neutral-200 shadow-sm group">
                                <img src={url} alt={`Existing general ${i}`} className="h-full w-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeGeneralImage(i, true)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                            {/* Newly added general image previews */}
                            {previewUrls.map((url, i) => (
                              <div key={`new-${i}`} className="relative aspect-square w-full rounded overflow-hidden bg-white border border-neutral-200 shadow-sm group">
                                <img src={url} alt={`New general ${i}`} className="h-full w-full object-cover border-2 border-indigo-400" />
                                <button
                                  type="button"
                                  onClick={() => removeGeneralImage(i, false)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <label className="cursor-pointer border-2 border-dashed border-neutral-300 hover:border-neutral-400 bg-neutral-50 hover:bg-neutral-100/50 p-6 rounded-md text-center flex flex-col items-center justify-center transition-colors relative group">
                          <UploadCloud className="mx-auto h-10 w-10 text-neutral-400 group-hover:text-neutral-500 mb-3" />
                          <div className="flex text-sm text-neutral-600 justify-center">
                            <span className="relative cursor-pointer bg-white rounded-md font-medium text-neutral-900 hover:text-neutral-700 px-3 py-1.5 shadow-sm border border-neutral-200">
                              Upload new files
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-2">Select multiple images (PNG, JPG, GIF up to 5MB each)</p>
                          <input
                            id="imageFile"
                            name="imageFile"
                            type="file"
                            accept="image/*"
                            multiple
                            className="sr-only"
                            onChange={handleGeneralImageChange}
                          />
                        </label>
                      </div>
                      {state.errors?.image && <p className="mt-1 text-xs text-red-600">{state.errors.image}</p>}
                    </div>
                  )}
                </div>

                {/* Column 2 */}
                <div className="space-y-6">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-neutral-700">Price (LKR) *</label>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      required
                      min="0"
                      step="0.01"
                      defaultValue={product.price}
                      placeholder="0.00"
                      className={`bg-white text-neutral-900 mt-1 block w-full shadow-sm sm:text-sm rounded-md py-2 px-3 border focus:outline-none focus:ring-2 focus:ring-offset-1 ${state.errors?.price ? 'border-red-300 text-red-900 focus:ring-red-500' : 'border-neutral-300 focus:ring-neutral-900 focus:border-neutral-900'}`}
                    />
                    {state.errors?.price && <p className="mt-1 text-xs text-red-600">{state.errors.price}</p>}
                  </div>

                  <div>
                    <label htmlFor="tag" className="block text-sm font-medium text-neutral-700">Tag / Badge</label>
                    <select
                      id="tag"
                      name="tag"
                      defaultValue={product.tag || ""}
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

              {/* Hidden inputs to pass computed attributes to actions */}
              <input type="hidden" name="variants" value={JSON.stringify(computedVariants)} />

              {/* Colours Section */}
              <div className="mt-8 border-t border-neutral-100 pt-6">
                <div>
                  <h4 className="text-base font-semibold text-neutral-950 font-serif">Colours</h4>
                  <p className="text-xs text-neutral-500">Select standard featured colours or pick a custom colour. Leave empty if there are no colour variations.</p>
                </div>
                <div className="mt-3 bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-3">
                  {/* Predefined colors chips */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-neutral-500 font-semibold mr-1">Add Featured Colors:</span>
                    {featuredColors.map((preset) => {
                      const isAdded = selectedColors.includes(preset.name);
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            if (isAdded) {
                              removeColor(preset.name);
                            } else {
                              addColor(preset.name);
                            }
                          }}
                          className={`w-6 h-6 rounded-full border transition-all hover:scale-110 flex-shrink-0 relative flex items-center justify-center cursor-pointer ${
                            isAdded ? 'ring-2 ring-neutral-900 ring-offset-1 border-neutral-400 scale-110' : 'border-neutral-300'
                          }`}
                          style={{ backgroundColor: preset.hex }}
                          title={preset.name}
                        >
                          {preset.name.toLowerCase() === 'white' && <span className="block w-full h-full border border-neutral-200 rounded-full"></span>}
                          {isAdded && <span className="text-[10px] text-neutral-700 font-bold bg-white/70 px-1 rounded">✓</span>}
                        </button>
                      );
                    })}

                    {/* Custom Color Palette Picker */}
                    <div className="relative w-6 h-6 rounded-full border border-neutral-300 hover:scale-110 transition-transform overflow-hidden cursor-pointer bg-[conic-gradient(from_0deg,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)]" title="Choose Custom Color">
                      <input
                        type="color"
                        value={customColorInput.startsWith('#') ? customColorInput : "#FFFFFF"}
                        onChange={(e) => {
                          setCustomColorInput(e.target.value);
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                  </div>

                  {/* Custom color review & apply section */}
                  {customColorInput && (
                    <div className="flex items-center gap-3 mt-3 p-2.5 bg-white rounded border border-neutral-200 w-fit shadow-sm animate-[fadeIn_0.2s_ease-out]">
                      <span className="text-xs text-neutral-500 font-semibold">Review Custom Color:</span>
                      <div 
                        className="w-5 h-5 rounded-full border border-neutral-300 shadow-inner flex-shrink-0"
                        style={{ backgroundColor: customColorInput }}
                      />
                      <span className="text-xs font-mono font-bold text-neutral-700">{customColorInput.toUpperCase()}</span>
                      
                      <button
                        type="button"
                        onClick={() => {
                          addColor(customColorInput);
                          addCustomColor(customColorInput);
                          setCustomColorInput("");
                        }}
                        className="px-2.5 py-1 bg-neutral-900 text-white hover:bg-neutral-800 text-[11px] font-bold rounded transition-colors cursor-pointer"
                      >
                        Apply Color
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setCustomColorInput("")}
                        className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors px-1 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Selected Colors List */}
                  {selectedColors.length > 0 && (
                    <div className="pt-2 border-t border-neutral-200">
                      <span className="text-xs text-neutral-500 font-semibold block mb-2">Selected Colors:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedColors.map((colorName) => (
                          <span key={colorName} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-neutral-300 shadow-sm">
                            <span className="w-2.5 h-2.5 rounded-full border border-neutral-300" style={{ backgroundColor: colorName.startsWith('#') ? colorName : (featuredColors.find(c => c.name.toLowerCase() === colorName.toLowerCase())?.hex || '#CCCCCC') }} />
                            {colorName}
                            <button type="button" onClick={() => removeColor(colorName)} className="text-neutral-400 hover:text-red-500 transition-colors ml-1 cursor-pointer">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sizes Section */}
              <div className="mt-6 border-t border-neutral-100 pt-6">
                <div>
                  <h4 className="text-base font-semibold text-neutral-950 font-serif">Sizes</h4>
                  <p className="text-xs text-neutral-500">Configure sizing system and select available sizes. Leave empty if there are no size variations.</p>
                </div>
                <div className="mt-3 bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-4">
                  <div className="flex gap-6">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="sizeSystemTypeRadio"
                        value="standard"
                        checked={sizeSystemType === "standard"}
                        onChange={() => {
                          setSizeSystemType("standard");
                          setSelectedSizes([]);
                        }}
                        className="focus:ring-neutral-900 h-4 w-4 text-neutral-900 border-neutral-300"
                      />
                      <span className="ml-2 text-sm font-medium text-neutral-800">Standard Text (S, M, L)</span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="sizeSystemTypeRadio"
                        value="numeric"
                        checked={sizeSystemType === "numeric"}
                        onChange={() => {
                          setSizeSystemType("numeric");
                          setSelectedSizes([]);
                        }}
                        className="focus:ring-neutral-900 h-4 w-4 text-neutral-900 border-neutral-300"
                      />
                      <span className="ml-2 text-sm font-medium text-neutral-800">Numeric Size (28, 30, 32)</span>
                    </label>
                  </div>

                  {sizeSystemType === "standard" ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-3">
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
                          const isAdded = selectedSizes.includes(sz);
                          return (
                            <label key={sz} className={`inline-flex items-center px-3 py-1.5 border rounded-md text-xs font-semibold cursor-pointer transition-all ${
                              isAdded ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm' : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100'
                            }`}>
                              <input
                                type="checkbox"
                                checked={isAdded}
                                onChange={() => {
                                  if (isAdded) {
                                    setSelectedSizes(selectedSizes.filter(s => s !== sz));
                                  } else {
                                    setSelectedSizes([...selectedSizes, sz]);
                                  }
                                }}
                                className="sr-only"
                              />
                              {sz}
                            </label>
                          );
                        })}
                      </div>
                      <div className="flex gap-2 max-w-xs">
                        <input
                          type="text"
                          placeholder="Add Custom Size (e.g. S/M)"
                          value={customSizeInput}
                          onChange={(e) => setCustomSizeInput(e.target.value)}
                          className="bg-white text-neutral-900 block w-full shadow-sm sm:text-sm rounded-md py-1.5 px-3 border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = customSizeInput.trim();
                            if (val && !selectedSizes.includes(val)) {
                              setSelectedSizes([...selectedSizes, val]);
                            }
                            setCustomSizeInput("");
                          }}
                          className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-md hover:bg-neutral-850 transition-colors cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 max-w-xs">
                      <input
                        type="number"
                        placeholder="Add Size (e.g. 30)"
                        value={customSizeInput}
                        onChange={(e) => setCustomSizeInput(e.target.value)}
                        className="bg-white text-neutral-900 block w-full shadow-sm sm:text-sm rounded-md py-1.5 px-3 border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = parseInt(customSizeInput);
                          if (!isNaN(val) && val > 0 && !selectedSizes.includes(val)) {
                            setSelectedSizes([...selectedSizes, val].sort((a, b) => Number(a) - Number(b)));
                          }
                          setCustomSizeInput("");
                        }}
                        className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-md hover:bg-neutral-850 transition-colors cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  )}

                  {/* Selected Sizes List */}
                  {selectedSizes.length > 0 && (
                    <div className="pt-2 border-t border-neutral-200">
                      <span className="text-xs text-neutral-500 font-semibold block mb-2">Selected Sizes:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedSizes.map((sz) => (
                          <span key={sz} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-neutral-300 shadow-sm">
                            {sz}
                            <button type="button" onClick={() => removeSize(sz)} className="text-neutral-400 hover:text-red-500 transition-colors ml-1 cursor-pointer">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Inventory & Stock Section */}
              <div className="mt-6 border-t border-neutral-100 pt-6">
                <div>
                  <h4 className="text-base font-semibold text-neutral-950 font-serif">Inventory & Stock</h4>
                  <p className="text-xs text-neutral-500">Specify stock availability for each product option.</p>
                </div>
                
                {getFilteredCombinations().length > 0 || deletedCombinations.filter(k => getCombinations().some(c => `${c.color}-${c.size}` === k)).length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {getFilteredCombinations().length > 0 && (
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                        {getFilteredCombinations().map((comb) => {
                          const combKey = `${comb.color}-${comb.size}`;
                          const colorName = comb.color;
                          const isDefaultColor = colorName === "Default";
                          
                          return (
                            <div key={combKey} className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 gap-4">
                              <div className="flex items-center gap-3">
                                {/* Color indicator if not Default */}
                                {!isDefaultColor && (
                                  <div
                                    className="w-5 h-5 rounded-full border border-neutral-300 shadow-inner flex-shrink-0"
                                    style={{ backgroundColor: colorName.startsWith('#') ? colorName : (featuredColors.find(c => c.name.toLowerCase() === colorName.toLowerCase())?.hex || '#CCCCCC') }}
                                    title={colorName}
                                  />
                                )}
                                <span className="text-sm font-semibold text-neutral-800">
                                  {!isDefaultColor ? `${colorName} — ` : ""}Size: {comb.size}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Stock:</label>
                                  <input
                                    type="number"
                                    min="0"
                                    required
                                    value={combinationStocks[combKey] === undefined ? "" : combinationStocks[combKey]}
                                    placeholder="10"
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value);
                                      setCombinationStocks(prev => ({
                                        ...prev,
                                        [combKey]: isNaN(val) ? 0 : val
                                      }));
                                    }}
                                    className="bg-white text-neutral-900 block w-24 shadow-sm sm:text-sm rounded-md py-1.5 px-3 border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeletedCombinations(prev => [...prev, combKey]);
                                  }}
                                  className="text-neutral-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors cursor-pointer"
                                  title="Delete variant combination"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {deletedCombinations.filter(k => getCombinations().some(c => `${c.color}-${c.size}` === k)).length > 0 && (
                      <div className="pt-4 border-t border-neutral-100">
                        <span className="text-xs text-neutral-500 font-semibold block mb-2">Excluded/Deleted Variations:</span>
                        <div className="flex flex-wrap gap-2">
                          {deletedCombinations.filter(k => getCombinations().some(c => `${c.color}-${c.size}` === k)).map((key) => {
                            const [c, s] = key.split('-');
                            return (
                              <span key={key} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-100 border border-neutral-200 text-xs text-neutral-600 font-medium">
                                {c !== 'Default' ? `${c} — ` : ""}Size: {s}
                                <button
                                  type="button"
                                  onClick={() => setDeletedCombinations(prev => prev.filter(k => k !== key))}
                                  className="text-neutral-400 hover:text-neutral-850 ml-1 font-bold text-sm leading-none transition-colors cursor-pointer"
                                  title="Restore variation"
                                >
                                  +
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 bg-neutral-50 p-4 rounded-lg border border-neutral-200 grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="baseStock" className="block text-sm font-medium text-neutral-700">Stock Quantity *</label>
                      <input
                        type="number"
                        id="baseStock"
                        min="0"
                        required
                        value={baseStock}
                        onChange={(e) => setBaseStock(parseInt(e.target.value) || 0)}
                        className="bg-white text-neutral-900 mt-1 block w-full shadow-sm sm:text-sm rounded-md py-1.5 px-3 border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                      />
                    </div>
                    <div>
                      <label htmlFor="baseColor" className="block text-sm font-medium text-neutral-700">Color (Optional)</label>
                      <input
                        type="text"
                        id="baseColor"
                        placeholder="e.g. Black"
                        value={baseColor}
                        onChange={(e) => setBaseColor(e.target.value)}
                        className="bg-white text-neutral-900 mt-1 block w-full shadow-sm sm:text-sm rounded-md py-1.5 px-3 border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Color Images Section */}
              {uniqueColors.length > 0 && (
                <div className="mt-8 border-t border-neutral-100 pt-6 animate-[fadeIn_0.2s_ease-out]">
                  <div>
                    <h4 className="text-base font-semibold text-neutral-950 font-serif">Color Variant Images</h4>
                    <p className="text-xs text-neutral-500">Upload or retain at least one representative image for each selected color variant.</p>
                  </div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {uniqueColors.map((colorName) => {
                      const existingPreviews = existingColorUrls[colorName] || [];
                      const newPreviews = colorPreviews[colorName] || [];

                      return (
                        <div key={colorName} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-col justify-between gap-3 animate-[fadeIn_0.2s_ease-out]">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
                              <span className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-inner" style={{ backgroundColor: colorName.startsWith('#') ? colorName : (featuredColors.find(c => c.name.toLowerCase() === colorName.toLowerCase())?.hex || '#CCCCCC') }} />
                              Images for {colorName} *
                            </span>
                          </div>

                          {(existingPreviews.length > 0 || newPreviews.length > 0) && (
                            <div className="grid grid-cols-3 gap-2 p-2 bg-white border border-neutral-200 rounded">
                              {/* Existing color image previews */}
                              {existingPreviews.map((url, i) => (
                                <div key={`exist-${colorName}-${i}`} className="relative aspect-square w-full rounded overflow-hidden bg-white border border-neutral-200 shadow-sm group">
                                  <img src={url} alt={`Existing ${colorName} ${i}`} className="h-full w-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => removeColorImage(colorName, i, true)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                              {/* Newly added color image previews */}
                              {newPreviews.map((url, i) => (
                                <div key={`new-${colorName}-${i}`} className="relative aspect-square w-full rounded overflow-hidden bg-white border border-neutral-200 shadow-sm group">
                                  <img src={url} alt={`New ${colorName} ${i}`} className="h-full w-full object-cover border-2 border-indigo-400" />
                                  <button
                                    type="button"
                                    onClick={() => removeColorImage(colorName, i, false)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <label className="cursor-pointer border border-dashed border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50/50 p-4 rounded text-center flex flex-col items-center justify-center transition-colors">
                            <UploadCloud className="w-6 h-6 text-neutral-400 mb-1" />
                            <span className="text-xs font-semibold text-neutral-700">Upload images</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleColorImagesChange(colorName, e)}
                              className="sr-only"
                            />
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-8 pt-5 border-t border-neutral-100 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={isPending || state.success}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-2.5 bg-neutral-900 text-base font-medium text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-70 cursor-pointer"
                >
                  {isPending ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => !isPending && onClose()}
                  disabled={isPending || state.success}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-neutral-300 shadow-sm px-6 py-2.5 bg-white text-base font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors disabled:opacity-70 cursor-pointer"
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

export default function EditProductModal({ product }: { product: AdminProduct }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-neutral-500 hover:text-neutral-900 mr-4 transition-colors p-1 hover:bg-neutral-100 rounded cursor-pointer inline-flex items-center"
        title="Edit product"
      >
        <Edit className="w-4 h-4" />
        <span className="sr-only">Edit</span>
      </button>

      {isOpen && <EditProductModalContent product={product} onClose={() => setIsOpen(false)} />}
    </>
  );
}
