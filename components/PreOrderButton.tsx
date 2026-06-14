"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function PreOrderButton() {
  const router = useRouter();
  const { setPendingCheckout } = useCart();
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    quantity: 1
  });
  const [formErrors, setFormErrors] = useState<any>({});

  const validateForm = () => {
    const errors: any = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";
    if (!formData.address.trim()) errors.address = "Address is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Trigger the checkout process
    setPendingCheckout({
      items: [
        {
          product: {
            id: "organic-cotton-overcoat",
            name: "The Signature Overcoat",
            price: 850,
            image: "/hero.png",
            category: "men",
            subCategory: "formal",
          },
          size: "L", // Default size for pre-order
          quantity: formData.quantity
        }
      ],
      shippingDetails: {
        name: formData.name,
        email: formData.email,
        address: formData.address
      },
      totalAmount: 850 * formData.quantity
    });

    router.push("/checkout/payment-method");
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="inline-block px-12 py-5 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors text-center w-full sm:w-auto shadow-xl"
      >
        Pre-Order Now
      </button>

      {/* Pre-Order Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-cream w-full max-w-md p-8 shadow-2xl relative animate-[slideUp_0.3s_ease-out]">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-espresso/50 hover:text-espresso text-2xl leading-none"
            >
              &times;
            </button>

            <h3 className="text-2xl font-serif text-espresso mb-2">Pre-Order Details</h3>
            <p className="text-espresso/60 text-sm mb-8">
              Proceeding with <strong>The Signature Overcoat</strong>
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              
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
                  <span>${850 * formData.quantity}</span>
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
