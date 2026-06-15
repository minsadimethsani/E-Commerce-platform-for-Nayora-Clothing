"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/data/cloths";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      try {
        const response = await fetch(`/api/products?query=${encodeURIComponent(query)}&limit=50`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error("Failed to fetch products for search", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (query) {
      fetchResults();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen">
      <section className="pt-24 pb-16 px-6 md:px-12 text-center bg-espresso/5 border-b border-espresso/10">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight">Search Results</h1>
        <p className="text-espresso/70 max-w-xl mx-auto text-sm uppercase tracking-widest font-bold">
          {query ? `Showing results for "${query}"` : "Enter a search term above"}
        </p>
      </section>

      <section className="container mx-auto px-4 md:px-8 py-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-espresso/20 border-t-espresso rounded-full animate-spin"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-serif mb-6">No products found</h2>
            <p className="text-espresso/70 mb-8">We couldn't find anything matching "{query}". Try another search term.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><div className="w-10 h-10 border-4 border-espresso/20 border-t-espresso rounded-full animate-spin"></div></div>}>
      <SearchResults />
    </Suspense>
  );
}
