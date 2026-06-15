"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CardDetailsPage() {
  const { pendingCheckout, setPendingCheckout, clearCart } = useCart();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
    cardholderName: ""
  });
  
  const [formErrors, setFormErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure we have pending checkout data
    if (!pendingCheckout) {
      router.replace("/cart");
    }
  }, [pendingCheckout, router]);

  if (!pendingCheckout) return null;

  const validateForm = () => {
    const errors: any = {};
    if (!formData.cardNumber.trim()) errors.cardNumber = "Card number is required";
    if (!formData.expiry.trim()) errors.expiry = "Expiry date is required";
    if (!formData.cvc.trim()) errors.cvc = "CVC is required";
    if (!formData.cardholderName.trim()) errors.cardholderName = "Cardholder name is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: pendingCheckout.items,
          shippingDetails: pendingCheckout.shippingDetails,
          paymentMethod: "Card"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment failed");
      }

      router.push(`/checkout/success?orderId=${data.orderId}`);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen">
      <section className="pt-6 md:pt-16 pb-16 px-6 md:px-12 text-center bg-espresso/5 border-b border-espresso/10">
        <h1 className="text-4xl font-serif font-bold mb-4 tracking-tight">Card Details</h1>
        <p className="text-espresso/70 max-w-xl mx-auto text-sm uppercase tracking-widest font-bold">Step 3 of 3</p>
      </section>

      <section className="container mx-auto px-4 py-16 flex flex-col items-center">
        <div className="w-full max-w-lg bg-white/50 p-8 shadow-sm border border-espresso/10">
          <h2 className="text-2xl font-serif mb-8 border-b border-espresso/10 pb-4">Secure Payment</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handlePay} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">Cardholder Name</label>
              <input 
                type="text" 
                placeholder="Name on card"
                value={formData.cardholderName}
                onChange={(e) => setFormData({...formData, cardholderName: e.target.value})}
                className={`w-full border ${formErrors.cardholderName ? 'border-red-500' : 'border-espresso/20'} bg-transparent px-4 py-3 text-sm outline-none focus:border-espresso transition-colors`}
              />
              {formErrors.cardholderName && <p className="text-red-500 text-xs mt-1">{formErrors.cardholderName}</p>}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">Card Number</label>
              <input 
                type="text" 
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                value={formData.cardNumber}
                onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                className={`w-full border ${formErrors.cardNumber ? 'border-red-500' : 'border-espresso/20'} bg-transparent px-4 py-3 text-sm outline-none focus:border-espresso transition-colors tracking-widest`}
              />
              {formErrors.cardNumber && <p className="text-red-500 text-xs mt-1">{formErrors.cardNumber}</p>}
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">Expiry Date</label>
                <input 
                  type="text" 
                  placeholder="MM/YY"
                  maxLength={5}
                  value={formData.expiry}
                  onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                  className={`w-full border ${formErrors.expiry ? 'border-red-500' : 'border-espresso/20'} bg-transparent px-4 py-3 text-sm outline-none focus:border-espresso transition-colors`}
                />
                {formErrors.expiry && <p className="text-red-500 text-xs mt-1">{formErrors.expiry}</p>}
              </div>
              <div className="w-1/2">
                <label className="block text-xs uppercase tracking-widest font-bold text-espresso mb-2">CVC</label>
                <input 
                  type="text" 
                  placeholder="123"
                  maxLength={4}
                  value={formData.cvc}
                  onChange={(e) => setFormData({...formData, cvc: e.target.value})}
                  className={`w-full border ${formErrors.cvc ? 'border-red-500' : 'border-espresso/20'} bg-transparent px-4 py-3 text-sm outline-none focus:border-espresso transition-colors`}
                />
                {formErrors.cvc && <p className="text-red-500 text-xs mt-1">{formErrors.cvc}</p>}
              </div>
            </div>

            <div className="pt-6 border-t border-espresso/10 mt-8">
              <div className="flex justify-between text-espresso font-bold text-xl mb-6">
                <span>Total to Pay:</span>
                <span>${pendingCheckout.totalAmount}</span>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors shadow-xl flex items-center justify-center disabled:opacity-70 gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin"></div>
                    Processing Payment...
                  </>
                ) : (
                  `Pay $${pendingCheckout.totalAmount}`
                )}
              </button>
              
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full py-3 mt-4 text-espresso/60 text-xs uppercase tracking-widest font-bold hover:text-espresso transition-colors"
              >
                Go Back
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
