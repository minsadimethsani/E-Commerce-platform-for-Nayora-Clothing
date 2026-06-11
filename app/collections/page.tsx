"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Mock Data for the Catalog
const allProducts = [
  { id: 1, name: "Silk Blend Slip Dress", category: "Women", price: 245, image: "/women.png", color: "Cream" },
  { id: 2, name: "Tailored Linen Blazer", category: "Men", price: 320, image: "/men.png", color: "Espresso" },
  { id: 3, name: "Woven Leather Tote", category: "Accessories", price: 185, image: "/accessories.png", color: "Olive" },
  { id: 4, name: "Organic Cotton Overcoat", category: "Unisex", price: 450, image: "/hero.png", color: "Espresso" },
  { id: 5, name: "Cashmere Turtleneck", category: "Women", price: 210, image: "/women.png", color: "Beaver" },
  { id: 6, name: "Pleated Wool Trousers", category: "Men", price: 190, image: "/men.png", color: "Black" },
  { id: 7, name: "Suede Ankle Boots", category: "Accessories", price: 290, image: "/accessories.png", color: "Beaver" },
  { id: 8, name: "Ribbed Knit Sweater", category: "Men", price: 175, image: "/hero.png", color: "Cream" },
];

const categories = ["All", "Women", "Men", "Accessories", "Unisex"];

export default function Collections() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProducts = activeCategory === "All" 
    ? allProducts 
    : allProducts.filter(p => p.category === activeCategory);

  return (
    <div className="flex flex-col w-full bg-cream text-espresso min-h-screen">
      {/* Page Header */}
      <section className="pt-24 pb-16 px-6 md:px-12 text-center bg-espresso/5 border-b border-espresso/10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 tracking-tight">The Collections</h1>
        <p className="text-espresso/70 max-w-xl mx-auto font-light text-lg">
          Explore our curated selection of timeless pieces. Designed with intention and crafted from the finest sustainable materials.
        </p>
      </section>

      <section className="container mx-auto px-4 md:px-8 py-16 flex flex-col md:flex-row gap-12 lg:gap-20">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0 space-y-12">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 border-b border-espresso/20 pb-3">Categories</h3>
            <ul className="space-y-4">
              {categories.map((cat) => (
                <li key={cat}>
                  <button 
                    onClick={() => setActiveCategory(cat)}
                    className={`text-sm tracking-wide transition-all duration-300 ${activeCategory === cat ? 'font-bold text-espresso translate-x-2' : 'text-espresso/60 hover:text-espresso hover:translate-x-1'}`}
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

          <div className="hidden md:block">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 border-b border-espresso/20 pb-3">Price Range</h3>
            <div className="space-y-4 text-sm text-espresso/70">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="accent-espresso w-4 h-4" />
                <span className="group-hover:text-espresso transition-colors">Under $200</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="accent-espresso w-4 h-4" />
                <span className="group-hover:text-espresso transition-colors">$200 - $400</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="accent-espresso w-4 h-4" />
                <span className="group-hover:text-espresso transition-colors">Over $400</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Active Filters & Sort */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 text-sm gap-6">
            <div className="text-espresso/60 font-medium">
              Showing <span className="text-espresso font-bold">{filteredProducts.length}</span> results for {activeCategory === "All" ? "All Categories" : activeCategory}
            </div>
            <div className="flex items-center gap-4 border border-espresso/20 px-4 py-2 rounded-sm bg-white/50">
              <span className="text-espresso/60 uppercase tracking-widest text-[10px] font-bold">Sort By</span>
              <select className="bg-transparent outline-none text-espresso font-medium cursor-pointer text-sm">
                <option>Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest Arrivals</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group flex flex-col">
                <Link href={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden mb-5 bg-espresso/5">
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" 
                  />
                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <button className="px-8 py-3 bg-cream text-espresso text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-olive hover:text-cream transition-colors translate-y-4 group-hover:translate-y-0 duration-500 shadow-xl">
                      Quick View
                    </button>
                  </div>
                </Link>
                <div className="flex flex-col text-center">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-espresso/40 mb-2 font-bold">{product.category}</span>
                  <Link href={`/product/${product.id}`} className="text-lg font-serif mb-2 hover:text-olive transition-colors text-espresso">
                    {product.name}
                  </Link>
                  <span className="font-semibold text-espresso/90 tracking-wide">${product.price}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="w-full py-20 text-center flex flex-col items-center">
              <h3 className="text-2xl font-serif text-espresso mb-4">No products found</h3>
              <p className="text-espresso/60 mb-8">We couldn't find any items matching your current filters.</p>
              <button 
                onClick={() => setActiveCategory("All")}
                className="px-8 py-3 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
