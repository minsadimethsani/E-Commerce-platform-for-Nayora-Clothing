"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount } = useCart();
  
  // Hydration mismatch fix
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="w-full border-b border-espresso/10 bg-cream/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-serif font-bold tracking-widest text-espresso">
          NAYORA
        </Link>
        <nav className="hidden md:flex gap-8 text-sm font-medium uppercase tracking-wider text-espresso/80">
          {pathname !== "/" && (
            <Link href="/" className="hover:text-olive transition-colors">
              Home
            </Link>
          )}
          <Link href="/collections" className="hover:text-olive transition-colors">
            Collections
          </Link>
          <Link href="/new-arrivals" className="hover:text-olive transition-colors">
            New Arrivals
          </Link>
          <Link href="/about" className="hover:text-olive transition-colors">
            Our Story
          </Link>
        </nav>
        <div className="flex items-center gap-6 text-espresso">
          {/* Search Toggle */}
          {isSearchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center border-b border-espresso/40 pb-1 animate-[fadeIn_0.2s_ease-out]">
              <input 
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="bg-transparent border-none outline-none text-sm text-espresso placeholder:text-espresso/40 w-32 md:w-48"
              />
              <button type="button" onClick={() => setIsSearchOpen(false)} className="ml-2 text-espresso/50 hover:text-espresso">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </form>
          ) : (
            <button aria-label="Search" onClick={() => setIsSearchOpen(true)} className="hover:text-olive transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
          )}
          <Link href="/cart" aria-label="Cart" className="hover:text-olive transition-colors relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-olive text-cream text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
