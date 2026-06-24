"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function PaymentMethodPage() {
  const { pendingCheckout, setPendingCheckout, clearCart } = useCart();
  const router = useRouter();
  
  const [selectedMethod, setSelectedMethod] = useState<string>("Card");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If user refreshes or accesses this page without a pending checkout, redirect to cart
    if (!pendingCheckout) {
      router.replace("/cart");
    }
  }, [pendingCheckout, router]);

  if (!pendingCheckout) return null; // Avoid rendering if state is lost

  const handleContinue = async () => {
    if (selectedMethod === "Card") {
      // Temporarily store the payment method in the context
      setPendingCheckout({
        ...pendingCheckout,
        paymentMethod: "Card"
      } as any);
      router.push("/checkout/card");
      return;
    }

    // If Bank Deposit or COD, process order first
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: pendingCheckout.items,
          shippingDetails: pendingCheckout.shippingDetails,
          paymentMethod: selectedMethod
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      if (selectedMethod === "Bank Deposit") {
        // Redirect to the bank deposit slip upload page
        router.push(`/checkout/bank-deposit?orderId=${data.orderId}&orderNumber=${data.orderNumber}&amount=${pendingCheckout.totalAmount}`);
      } else {
        // Redirect to the dedicated Order Confirmed page (COD)
        router.push(`/checkout/success?orderId=${data.orderId}`);
      }
      
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };



  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen">
      <section className="pt-6 md:pt-16 pb-16 px-6 md:px-12 text-center bg-espresso/5 border-b border-espresso/10">
        <h1 className="text-4xl font-serif font-bold mb-4 tracking-tight">Payment Method</h1>
        <p className="text-espresso/70 max-w-xl mx-auto text-sm uppercase tracking-widest font-bold">Step 2 of 3</p>
      </section>

      <section className="container mx-auto px-4 py-16 flex flex-col items-center">
        <div className="w-full max-w-xl bg-white/50 p-8 shadow-sm border border-espresso/10">
          <h2 className="text-2xl font-serif mb-8 border-b border-espresso/10 pb-4">Select Payment Option</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-10">
            {["Card", "Bank Deposit", "Cash on Delivery"].map((method) => (
              <label 
                key={method}
                className={`flex items-center gap-4 p-5 border cursor-pointer transition-all ${
                  selectedMethod === method 
                    ? 'border-espresso bg-espresso/5 shadow-md' 
                    : 'border-espresso/20 hover:border-espresso/40'
                }`}
              >
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value={method} 
                  checked={selectedMethod === method}
                  onChange={() => setSelectedMethod(method)}
                  className="w-5 h-5 accent-espresso"
                />
                <span className="font-medium text-lg">{method}</span>
              </label>
            ))}
          </div>

          <div className="border-t border-espresso/10 pt-6">
            <div className="flex justify-between text-espresso font-bold text-xl mb-8">
              <span>Total to Pay:</span>
              <span>LKR {pendingCheckout.totalAmount}</span>
            </div>

            <button 
              onClick={handleContinue}
              disabled={isLoading}
              className="w-full py-5 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors shadow-xl flex items-center justify-center disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin"></div>
              ) : selectedMethod === "Card" ? (
                "Continue to Card Details"
              ) : (
                "Confirm Order"
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
