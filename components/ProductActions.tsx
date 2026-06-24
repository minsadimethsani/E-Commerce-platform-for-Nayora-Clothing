"use client";

import { useState, useEffect, useMemo } from "react";
import { Product, ProductVariant } from "@/data/cloths";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ProductActionsProps {
  product: Product;
  onColorChange?: (color: string) => void;
}

export default function ProductActions({ product, onColorChange }: ProductActionsProps) {
  const [liveProduct, setLiveProduct] = useState<Product>(product);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ name: "", email: "", address: "", quantity: 1 });
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{name?: string, email?: string, address?: string}>({});

  const { addToCart, setPendingCheckout } = useCart();
  const router = useRouter();

  // Listen to Firestore real-time changes
  useEffect(() => {
    if (!product.id) return;
    const docRef = doc(db, "products", String(product.id));
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLiveProduct({
          ...product,
          ...data,
          id: docSnap.id
        } as any);
      }
    });
    return () => unsubscribe();
  }, [product.id]);

  // Derived arrays
  const variants = useMemo(() => {
    return liveProduct.variants && liveProduct.variants.length > 0
      ? liveProduct.variants
      : [{
          SKU_ID: `NYR-${String(liveProduct.id).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10)}-DEFAULT-S`,
          color: liveProduct.color || "Default",
          size: "S",
          stock_quantity: (liveProduct as any).quantity !== undefined ? (liveProduct as any).quantity : 10
        }];
  }, [liveProduct]);

  const colors = useMemo(() => Array.from(new Set(variants.map(v => v.color))), [variants]);
  const sizes = useMemo(() => Array.from(new Set(variants.map(v => v.size))), [variants]);
  const hasMultipleSizes = sizes.length > 1;

  // Trigger onColorChange callback when selected color updates
  useEffect(() => {
    if (selectedColor && onColorChange) {
      onColorChange(selectedColor);
    }
  }, [selectedColor, onColorChange]);

  // Auto-select first color on load
  useEffect(() => {
    if (colors.length > 0) {
      if (!selectedColor || !colors.some(c => c.toLowerCase() === selectedColor.toLowerCase())) {
        setSelectedColor(colors[0]);
      }
    }
  }, [colors, selectedColor]);

  // Auto-select size if there's only one size option
  useEffect(() => {
    if (sizes.length === 1) {
      setSelectedSize(String(sizes[0]));
    } else if (sizes.length > 1 && !sizes.some(s => String(s) === String(selectedSize))) {
      setSelectedSize(null);
    }
  }, [sizes, selectedSize]);

  // Reset states when the product itself changes
  useEffect(() => {
    // Sync live product state when the product prop changes
    setLiveProduct(product);

    const initialVariants = product.variants && product.variants.length > 0
      ? product.variants
      : [{
          SKU_ID: `NYR-${String(product.id).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10)}-DEFAULT-S`,
          color: product.color || "Default",
          size: "S",
          stock_quantity: (product as any).quantity !== undefined ? (product as any).quantity : 10
        }];

    const initialColors = Array.from(new Set(initialVariants.map(v => v.color)));
    const initialSizes = Array.from(new Set(initialVariants.map(v => v.size)));

    if (initialColors.length > 0) {
      setSelectedColor(initialColors[0]);
      if (initialSizes.length > 1) {
        setSelectedSize(null);
      } else if (initialSizes.length === 1) {
        setSelectedSize(String(initialSizes[0]));
      }
    }
  }, [product.id]);

  // Find the selected variant and its stock status
  const selectedVariant = variants.find(
    v => v.color.toLowerCase() === selectedColor.toLowerCase() && 
         String(v.size).toLowerCase() === String(selectedSize).toLowerCase()
  );
  const isCurrentOutOfStock = selectedSize !== null && (!selectedVariant || selectedVariant.stock_quantity === 0);

  const handleBuyNowClick = () => {
    if (!selectedColor) {
      setError("Please select a color before proceeding.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (!selectedSize) {
      setError("Please select a size before proceeding.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (isCurrentOutOfStock) return;
    setError(null);
    setIsModalOpen(true);
  };

  const handleAddToCartClick = () => {
    if (!selectedColor) {
      setError("Please select a color before adding to cart.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (!selectedSize) {
      setError("Please select a size before adding to cart.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (isCurrentOutOfStock) return;
    setError(null);

    // Create a product instance with the selected variant color
    const productWithColor = {
      ...product,
      color: selectedColor
    };

    addToCart(productWithColor, selectedSize, 1);
    
    // Optional visual feedback
    const btn = document.getElementById("add-to-cart-btn");
    if (btn) {
      const originalText = btn.innerText;
      btn.innerText = "Added!";
      setTimeout(() => { btn.innerText = originalText; }, 2000);
    }
  };

  const validateForm = () => {
    const errors: any = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (!formData.address.trim()) errors.address = "Address is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isCurrentOutOfStock) return;

    const productWithColor = {
      ...product,
      color: selectedColor
    };

    // Set pending checkout in Context and redirect to payment
    setPendingCheckout({
      items: [
        {
          product: productWithColor,
          size: selectedSize!,
          quantity: formData.quantity
        }
      ],
      shippingDetails: {
        name: formData.name,
        email: formData.email,
        address: formData.address,
      },
      totalAmount: product.price * formData.quantity
    });

    router.push("/checkout/payment-method");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError(null);
    setFormErrors({});
  };

  const getColorHex = (colorName: string): string => {
    const name = colorName.toLowerCase().trim();
    const presets: Record<string, string> = {
      cream: "#F5F2EB",
      espresso: "#2C241E",
      olive: "#556B2F",
      beaver: "#9F8170",
      black: "#000000",
      white: "#FFFFFF",
      navy: "#1D2A44",
      gold: "#D4AF37",
      tortoise: "#B8860B",
      cream_white: "#FDFBF7",
      creamwhite: "#FDFBF7",
    };
    return presets[name] || name;
  };

  return (
    <>
      {/* Color Selection */}
      {colors.length > 0 && colors[0] !== "Default" && (
        <div className="mb-8">
          <span className="block text-xs uppercase tracking-widest font-bold mb-4">Color: {selectedColor}</span>
          <div className="flex items-center gap-4">
            {colors.map((col) => {
              const hex = getColorHex(col);
              const isSelected = selectedColor.toLowerCase() === col.toLowerCase();
              return (
                <button
                  key={col}
                  type="button"
                  onClick={() => {
                    setSelectedColor(col);
                    setSelectedSize(null);
                  }}
                  className={`w-8 h-8 rounded-full border transition-all hover:scale-110 relative flex items-center justify-center ${
                    isSelected ? 'ring-2 ring-espresso ring-offset-2 border-espresso' : 'border-espresso/20'
                  }`}
                  style={{ backgroundColor: hex }}
                  title={col}
                >
                  {col.toLowerCase() === 'white' && <span className="absolute inset-0 border border-espresso/10 rounded-full"></span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {hasMultipleSizes && (
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <span className="text-xs uppercase tracking-widest font-bold">Size</span>
            <button className="text-[10px] uppercase tracking-widest font-bold text-espresso/50 hover:text-espresso underline underline-offset-4">Size Guide</button>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {sizes.map((size) => {
              const currentVariant = variants.find(
                v => v.color.toLowerCase() === selectedColor.toLowerCase() && 
                     String(v.size).toLowerCase() === String(size).toLowerCase()
              );
              const stock = currentVariant ? currentVariant.stock_quantity : 0;
              const isOutOfStock = stock === 0;
              const isSelected = String(selectedSize) === String(size);

              return (
                <button 
                  key={String(size)} 
                  type="button"
                  onClick={() => setSelectedSize(String(size))}
                  className={`py-3 border transition-all text-sm font-medium relative overflow-hidden ${
                    isSelected 
                      ? 'border-espresso bg-espresso text-cream' 
                      : isOutOfStock
                        ? 'border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-50 bg-[linear-gradient(to_top_right,transparent_46%,#999_49%,#999_51%,transparent_54%)]'
                        : 'border-espresso/20 hover:border-espresso hover:bg-espresso/5 text-espresso'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
          {/* Error message for missing size on main page */}
          {error && !isModalOpen && (
            <p className="text-red-500 text-sm mt-3 animate-pulse">{error}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-16">
        <button 
          id="add-to-cart-btn"
          disabled={isCurrentOutOfStock}
          onClick={handleAddToCartClick}
          className={`w-full sm:w-1/2 py-5 border text-sm uppercase tracking-widest font-bold transition-all ${
            isCurrentOutOfStock
              ? 'border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-75'
              : 'border-espresso text-espresso hover:bg-espresso/5 cursor-pointer'
          }`}
        >
          {isCurrentOutOfStock ? "OUT OF STOCK" : "Add to Cart"}
        </button>
        <button 
          disabled={isCurrentOutOfStock}
          onClick={handleBuyNowClick}
          className={`w-full sm:w-1/2 py-5 text-sm uppercase tracking-widest font-bold transition-all shadow-xl ${
            isCurrentOutOfStock
              ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed opacity-75 shadow-none'
              : 'bg-espresso text-cream hover:bg-espresso/90 cursor-pointer'
          }`}
        >
          {isCurrentOutOfStock ? "OUT OF STOCK" : "Buy Now"}
        </button>
      </div>

      {/* Checkout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso/40 backdrop-blur-sm">
          <div className="bg-cream w-full max-w-lg p-8 shadow-2xl relative animate-[fadeIn_0.3s_ease-out]">
            {/* Close Button */}
            <button 
              onClick={handleCloseModal}
              className="absolute top-6 right-6 text-espresso/50 hover:text-espresso text-xl font-bold"
            >
              &times;
            </button>

            <h3 className="text-2xl font-serif text-espresso mb-2">Buy Now Details</h3>
            <p className="text-espresso/60 text-sm mb-8">
              Proceeding with <strong>{product.name}</strong> (Color: {selectedColor}, Size: {selectedSize})
            </p>

            <form onSubmit={handleCheckoutSubmit} className="space-y-5">
              
              <div className="flex gap-4">
                <div className="w-1/3">
                  <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">Quantity</label>
                  <input 
                    type="number" 
                    min="1"
                    max={selectedVariant ? selectedVariant.stock_quantity : undefined}
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                    className="w-full border border-espresso/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-espresso transition-colors text-espresso"
                  />
                </div>
                <div className="w-2/3">
                  <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full border ${formErrors.name ? 'border-red-500' : 'border-espresso/20'} bg-transparent px-4 py-3 text-sm outline-none focus:border-espresso transition-colors text-espresso`}
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full border ${formErrors.email ? 'border-red-500' : 'border-espresso/20'} bg-transparent px-4 py-3 text-sm outline-none focus:border-espresso transition-colors text-espresso`}
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">Shipping Address</label>
                <textarea 
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className={`w-full border ${formErrors.address ? 'border-red-500' : 'border-espresso/20'} bg-transparent px-4 py-3 text-sm outline-none focus:border-espresso transition-colors resize-none text-espresso`}
                ></textarea>
                {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
              </div>

              <div className="pt-4 border-t border-espresso/10 mt-6">
                <div className="flex justify-between text-espresso font-bold text-lg mb-6">
                  <span>Total:</span>
                  <span>LKR {product.price * formData.quantity}</span>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors shadow-xl flex items-center justify-center gap-3"
                >
                  Proceed to Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
