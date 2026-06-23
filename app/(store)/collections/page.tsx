"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { Product } from "@/data/cloths";

const ITEMS_PER_PAGE = 9;

function CollectionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Dynamic categories state
  const [categories, setCategories] = useState<string[]>(["All"]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          const names = data.map((c: any) => c.name);
          setCategories(["All", ...names]);
        }
      } catch (err) {
        console.error("Failed to load categories for collections", err);
      }
    }
    loadCategories();
  }, []);

  // Read initial state from URL or use defaults
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "All");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1", 10));
  const [sortOption, setSortOption] = useState(searchParams.get("sort") || "Featured");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state to URL and fetch data
  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams();
    if (activeCategory !== "All") params.set("category", activeCategory);
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (sortOption !== "Featured") params.set("sort", sortOption);
    if (debouncedSearchQuery.trim() !== "") params.set("query", debouncedSearchQuery.trim());
    
    router.replace(`/collections?${params.toString()}`, { scroll: false });

    // Fetch from API
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products?${params.toString()}&limit=${ITEMS_PER_PAGE}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        
        if (!ignore) {
          setProducts(data.products);
          setTotalPages(data.totalPages);
          setTotalItems(data.total);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Error fetching products:", err);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      ignore = true;
    };
  }, [activeCategory, currentPage, sortOption, debouncedSearchQuery, router]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1); // Reset to page 1 on category change
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
    setCurrentPage(1); // Reset to page 1 on sort change
  };

  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen">
      {/* Page Header */}
      <section className="pt-6 md:pt-16 pb-16 px-6 md:px-12 text-center bg-espresso/5 border-b border-espresso/10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 tracking-tight">The Collections</h1>
        <p className="text-espresso/70 max-w-xl mx-auto font-light text-lg">
          Explore our curated selection of timeless pieces. Designed with intention and crafted from the finest sustainable materials.
        </p>
      </section>

      <section className="container mx-auto px-4 md:px-8 py-16 flex flex-col md:flex-row gap-12 lg:gap-20">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0 space-y-12">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 border-b border-espresso/20 pb-3">Search</h3>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-espresso/20 bg-transparent px-4 py-2 text-sm outline-none focus:border-espresso transition-colors placeholder:text-espresso/40"
              />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 border-b border-espresso/20 pb-3">Categories</h3>
            <ul className="space-y-4">
              {categories.map((cat) => (
                <li key={cat}>
                  <button 
                    onClick={() => handleCategoryChange(cat)}
                    className={`text-sm tracking-wide transition-all duration-300 ${activeCategory.toLowerCase() === cat.toLowerCase() ? 'font-bold text-espresso translate-x-2' : 'text-espresso/60 hover:text-espresso hover:translate-x-1'}`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="hidden md:block">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 border-b border-espresso/20 pb-3">Filter by Color</h3>
            <div className="flex flex-wrap gap-4">
              {["bg-[#FAF9F6] border border-espresso/20", "bg-[#3E2723]", "bg-[#606C38]", "bg-[#9F8170]", "bg-[#4A0E17]", "bg-[#111111]"].map((colorClass, idx) => (
                <button key={idx} className={`w-7 h-7 rounded-full ${colorClass} hover:scale-110 transition-transform shadow-sm cursor-pointer border border-black/5`} aria-label="Color Filter"></button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 min-h-[600px]">
          {/* Active Filters & Sort */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 text-sm gap-6">
            <div className="text-espresso/60 font-medium">
              Showing <span className="text-espresso font-bold">{totalItems}</span> results
              {debouncedSearchQuery && (
                <span> for "<span className="text-espresso font-bold">{debouncedSearchQuery}</span>"</span>
              )}
              {activeCategory !== "All" ? (
                <span> in {activeCategory}</span>
              ) : (
                !debouncedSearchQuery && <span> for All Categories</span>
              )}
            </div>
            <div className="flex items-center gap-4 border border-espresso/20 px-4 py-2 rounded-sm bg-white/50">
              <span className="text-espresso/60 uppercase tracking-widest text-[10px] font-bold">Sort By</span>
              <select 
                value={sortOption}
                onChange={handleSortChange}
                className="bg-transparent outline-none text-espresso font-medium cursor-pointer text-sm"
              >
                <option value="Featured">Featured</option>
                <option value="Price: Low to High">Price: Low to High</option>
                <option value="Price: High to Low">Price: High to Low</option>
                <option value="Newest Arrivals">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {Array.from({ length: 9 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-16 gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 border border-espresso/20 flex items-center justify-center disabled:opacity-50 hover:bg-espresso hover:text-cream transition-colors text-sm"
                  >
                    &larr;
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 border flex items-center justify-center transition-colors text-sm ${
                        currentPage === i + 1 
                          ? 'bg-espresso text-cream border-espresso' 
                          : 'border-espresso/20 hover:bg-espresso/10 text-espresso'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 border border-espresso/20 flex items-center justify-center disabled:opacity-50 hover:bg-espresso hover:text-cream transition-colors text-sm"
                  >
                    &rarr;
                  </button>
                </div>
              )}
              
              {/* Empty State */}
              {products.length === 0 && (
                <div className="w-full py-20 text-center flex flex-col items-center">
                  <h3 className="text-2xl font-serif text-espresso mb-4">No products found</h3>
                  <p className="text-espresso/60 mb-8">We couldn't find any items matching your current filters.</p>
                  <button 
                    onClick={() => {
                      setActiveCategory("All");
                      setCurrentPage(1);
                      setSortOption("Featured");
                    }}
                    className="px-8 py-3 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default function Collections() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-espresso"></div>
      </div>
    }>
      <CollectionsContent />
    </Suspense>
  );
}
