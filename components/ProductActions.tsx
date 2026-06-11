"use client";

import { useState } from "react";
import { Product } from "@/data/cloths";

interface ProductActionsProps {
  product: Product;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ name: "", email: "", address: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{name?: string, email?: string, address?: string}>({});

  const handleBuyNowClick = () => {
    if (!selectedSize) {
      setError("Please select a size before proceeding.");
      // Auto-clear the error after 3 seconds
      setTimeout(() => setError(null), 3000);
      return;
    }
    setError(null);
    setIsModalOpen(true);
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
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          size: selectedSize,
          ...formData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      setSuccess(`Order Confirmed! Your Order ID is ${data.orderId}`);
      // Clear form on success
      setFormData({ name: "", email: "", address: "" });
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!isLoading && !success) {
      setIsModalOpen(false);
      setError(null);
      setFormErrors({});
    } else if (success) {
      setIsModalOpen(false);
      setSuccess(null);
      setSelectedSize(null);
    }
  };

  return (
    <>
      {/* Size Selection */}
      <div className="mb-12">
        <div className="flex justify-between items-end mb-4">
          <span className="text-xs uppercase tracking-widest font-bold">Size</span>
          <button className="text-[10px] uppercase tracking-widest font-bold text-espresso/50 hover:text-espresso underline underline-offset-4">Size Guide</button>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
            <button 
              key={size} 
              onClick={() => setSelectedSize(size)}
              className={`py-3 border transition-all text-sm font-medium ${
                selectedSize === size 
                  ? 'border-espresso bg-espresso text-cream' 
                  : 'border-espresso/20 hover:border-espresso hover:bg-espresso/5 text-espresso'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        {/* Error message for missing size on main page */}
        {error && !isModalOpen && (
          <p className="text-red-500 text-sm mt-3 animate-pulse">{error}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-16">
        <button 
          onClick={() => {
            if(!selectedSize) setError("Please select a size.");
            else alert("Added to cart! (Mock)");
          }}
          className="w-full sm:w-1/2 py-5 border border-espresso text-espresso text-sm uppercase tracking-widest font-bold hover:bg-espresso/5 transition-colors"
        >
          Add to Cart
        </button>
        <button 
          onClick={handleBuyNowClick}
          className="w-full sm:w-1/2 py-5 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors shadow-xl"
        >
          Buy Now
        </button>
      </div>

      {/* Checkout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso/40 backdrop-blur-sm">
          <div className="bg-cream w-full max-w-lg p-8 shadow-2xl relative animate-[fadeIn_0.3s_ease-out]">
            {/* Close Button */}
            {(!isLoading) && (
              <button 
                onClick={handleCloseModal}
                className="absolute top-6 right-6 text-espresso/50 hover:text-espresso text-xl font-bold"
              >
                &times;
              </button>
            )}

            {success ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-olive/20 text-olive rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-3xl font-serif text-espresso mb-4">Thank You!</h3>
                <p className="text-espresso/70 mb-8">{success}</p>
                <button 
                  onClick={handleCloseModal}
                  className="px-8 py-4 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-serif text-espresso mb-2">Secure Checkout</h3>
                <p className="text-espresso/60 text-sm mb-8">
                  Completing purchase for <strong>{product.name}</strong> (Size: {selectedSize})
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm mb-6">
                    {error}
                  </div>
                )}

                <form onSubmit={handleCheckoutSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={`w-full border ${formErrors.name ? 'border-red-500' : 'border-espresso/20'} bg-transparent px-4 py-3 text-sm outline-none focus:border-espresso transition-colors`}
                    />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">Email Address</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={`w-full border ${formErrors.email ? 'border-red-500' : 'border-espresso/20'} bg-transparent px-4 py-3 text-sm outline-none focus:border-espresso transition-colors`}
                    />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">Shipping Address</label>
                    <textarea 
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className={`w-full border ${formErrors.address ? 'border-red-500' : 'border-espresso/20'} bg-transparent px-4 py-3 text-sm outline-none focus:border-espresso transition-colors resize-none`}
                    ></textarea>
                    {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                  </div>

                  <div className="pt-4 border-t border-espresso/10 mt-6">
                    <div className="flex justify-between text-espresso font-bold text-lg mb-6">
                      <span>Total:</span>
                      <span>${product.price}</span>
                    </div>

                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-5 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        `Pay $${product.price}`
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
