"use client";

import { useState } from "react";
import { Product } from "@/data/cloths";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

interface ProductActionsProps {
  product: Product;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ name: "", email: "", address: "", quantity: 1 });
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{name?: string, email?: string, address?: string}>({});

  const { addToCart, setPendingCheckout } = useCart();
  const router = useRouter();

  const handleBuyNowClick = () => {
    if (!selectedSize) {
      setError("Please select a size before proceeding.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleAddToCartClick = () => {
    if (!selectedSize) {
      setError("Please select a size before adding to cart.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    setError(null);
    addToCart(product, selectedSize, 1);
    
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
    if (!validateForm()) return;

    // Set pending checkout in Context and redirect to payment
    setPendingCheckout({
      items: [
        {
          product,
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
          id="add-to-cart-btn"
          onClick={handleAddToCartClick}
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
            <button 
              onClick={handleCloseModal}
              className="absolute top-6 right-6 text-espresso/50 hover:text-espresso text-xl font-bold"
            >
              &times;
            </button>

            <h3 className="text-2xl font-serif text-espresso mb-2">Buy Now Details</h3>
            <p className="text-espresso/60 text-sm mb-8">
              Proceeding with <strong>{product.name}</strong> (Size: {selectedSize})
            </p>

            <form onSubmit={handleCheckoutSubmit} className="space-y-5">
              
              <div className="flex gap-4">
                <div className="w-1/3">
                  <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">Quantity</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                    className="w-full border border-espresso/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-espresso transition-colors"
                  />
                </div>
                <div className="w-2/3">
                  <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full border ${formErrors.name ? 'border-red-500' : 'border-espresso/20'} bg-transparent px-4 py-3 text-sm outline-none focus:border-espresso transition-colors`}
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
                  <span>${product.price * formData.quantity}</span>
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
