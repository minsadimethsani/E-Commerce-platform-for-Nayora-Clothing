"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, setPendingCheckout } = useCart();
  const router = useRouter();

  // Form State for shipping details if user proceeds from Cart
  const [formData, setFormData] = useState({ name: "", email: "", address: "" });
  const [formErrors, setFormErrors] = useState<{name?: string, email?: string, address?: string}>({});

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

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!validateForm()) return;

    setPendingCheckout({
      items: cart,
      shippingDetails: {
        name: formData.name,
        email: formData.email,
        address: formData.address,
      },
      totalAmount: cartTotal
    });

    router.push("/checkout/payment-method");
  };

  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen">
      <section className="pt-6 md:pt-16 pb-16 px-6 md:px-12 text-center bg-espresso/5 border-b border-espresso/10">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight">Shopping Cart</h1>
      </section>

      <section className="container mx-auto px-4 md:px-8 py-16">
        {cart.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-serif mb-6">Your cart is empty</h2>
            <Link 
              href="/collections"
              className="inline-block px-10 py-4 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-16">
            
            {/* Cart Items */}
            <div className="flex-1 space-y-8">
              <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-espresso/10 text-xs font-bold uppercase tracking-widest text-espresso/60">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center">Total</div>
                <div className="col-span-2 text-right">Remove</div>
              </div>

              {cart.map((item, index) => (
                <div key={`${item.product.id}-${item.size}-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-4 border-b border-espresso/5">
                  <div className="col-span-1 md:col-span-6 flex gap-6 items-center">
                    <div className="relative w-24 aspect-[3/4] bg-espresso/5 shrink-0">
                      <Image 
                        src={item.product.image || "/hero.png"} 
                        alt={item.product.name || "Product"} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="flex flex-col">
                      <Link href={`/product/${item.product.id}`} className="font-serif text-lg mb-1 hover:text-olive transition-colors">
                        {item.product.name}
                      </Link>
                      <span className="text-sm text-espresso/70 mb-1">LKR {item.product.price}</span>
                      <span className="text-xs uppercase tracking-widest font-bold text-espresso/50">Size: {item.size}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center">
                    <div className="flex items-center border border-espresso/20">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-espresso/5"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-espresso/5"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 text-left md:text-center font-medium">
                    LKR {item.product.price * item.quantity}
                  </div>

                  <div className="col-span-1 md:col-span-2 text-left md:text-right">
                    <button 
                      onClick={() => removeFromCart(item.product.id, item.size)}
                      className="text-xs uppercase tracking-widest font-bold text-red-500 hover:text-red-700 underline underline-offset-4"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Summary & Details Form */}
            <div className="w-full lg:w-96 shrink-0">
              <div className="bg-espresso/5 p-8 border border-espresso/10">
                <h3 className="text-xl font-serif mb-6 border-b border-espresso/10 pb-4">Order Summary</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-espresso/70">Subtotal</span>
                    <span>LKR {cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-espresso/70">Shipping</span>
                    <span>Calculated at next step</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-espresso/10 pt-4">
                    <span>Total</span>
                    <span>LKR {cartTotal}</span>
                  </div>
                </div>

                <form onSubmit={handleCheckout} className="space-y-5">
                  <h4 className="text-xs font-bold uppercase tracking-widest border-b border-espresso/10 pb-2 mb-4">Shipping Details</h4>
                  
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

                  <button 
                    type="submit"
                    className="w-full py-5 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors shadow-xl mt-4"
                  >
                    Proceed to Payment
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}
      </section>
    </div>
  );
}
