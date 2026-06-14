"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useCart } from "@/context/CartContext";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { clearCart, setPendingCheckout } = useCart();

  useEffect(() => {
    // Clear cart and pending checkout now that the user is safely on the success page
    clearCart();
    setPendingCheckout(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-[80vh] items-center justify-center p-6">
      <div className="text-center py-12 max-w-lg bg-white/50 p-8 shadow-xl border border-espresso/10 w-full animate-[fadeIn_0.5s_ease-out]">
        <div className="w-24 h-24 bg-olive/10 text-olive rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-olive/20">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
        </div>
        
        <h1 className="text-4xl font-serif text-espresso mb-4">Order Confirmed!</h1>
        
        <p className="text-espresso/70 mb-6 text-lg">
          Thank you for your purchase. We've received your order and are getting it ready to be shipped.
        </p>

        {orderId && (
          <div className="bg-espresso/5 p-4 rounded mb-10 border border-espresso/10">
            <span className="block text-xs uppercase tracking-widest font-bold text-espresso/60 mb-1">Your Order ID</span>
            <span className="font-mono text-lg font-bold text-espresso">{orderId}</span>
          </div>
        )}

        <Link 
          href="/collections"
          className="inline-block w-full px-10 py-5 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors shadow-lg"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] bg-cream flex items-center justify-center"><div className="w-8 h-8 border-4 border-espresso/20 border-t-espresso rounded-full animate-spin"></div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
