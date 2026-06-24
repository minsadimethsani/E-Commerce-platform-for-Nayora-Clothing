"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/data/cloths";

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

interface PendingCheckout {
  items: CartItem[];
  shippingDetails: {
    name: string;
    email: string;
    address: string;
    phone?: string;
  };
  totalAmount: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: string, quantity: number) => void;
  removeFromCart: (productId: string | number, size: string) => void;
  updateQuantity: (productId: string | number, size: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  pendingCheckout: PendingCheckout | null;
  setPendingCheckout: (data: PendingCheckout | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pendingCheckout, setPendingCheckout] = useState<PendingCheckout | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("nayora_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart");
      }
    }
    const savedCheckout = localStorage.getItem("nayora_pending_checkout");
    if (savedCheckout) {
      try {
        setPendingCheckout(JSON.parse(savedCheckout));
      } catch (e) {
        console.error("Failed to parse pending checkout");
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("nayora_cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      if (pendingCheckout) {
        localStorage.setItem("nayora_pending_checkout", JSON.stringify(pendingCheckout));
      } else {
        localStorage.removeItem("nayora_pending_checkout");
      }
    }
  }, [pendingCheckout, isLoaded]);

  const addToCart = (product: Product, size: string, quantity: number) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.size === size
      );

      if (existingItemIndex >= 0) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      } else {
        return [...prevCart, { product, size, quantity }];
      }
    });
  };

  const removeFromCart = (productId: string | number, size: string) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.size === size)));
  };

  const updateQuantity = (productId: string | number, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        pendingCheckout,
        setPendingCheckout
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
