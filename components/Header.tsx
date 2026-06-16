"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useEffect, useState, useRef } from 'react';
import { User, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { logoutAction } from '@/app/auth/actions';

export default function Header({ session }: { session: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount } = useCart();
  
  // Hydration mismatch fix
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const isAdmin = session && ['super_admin', 'admin', 'employee'].includes(session.role);

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
        <div className="flex items-center gap-6 text-espresso relative">
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
          
          {/* User Profile */}
          <div className="relative" ref={profileRef}>
            {session ? (
              <button 
                aria-label="Profile" 
                onClick={() => setIsProfileOpen(!isProfileOpen)} 
                className="hover:text-olive transition-colors flex items-center"
              >
                <User size={22} strokeWidth={1.5} />
              </button>
            ) : (
              <Link href="/auth/login" aria-label="Login" className="hover:text-olive transition-colors flex items-center">
                <User size={22} strokeWidth={1.5} />
              </Link>
            )}

            {isProfileOpen && session && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none animate-in slide-in-from-top-2 z-50">
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p className="text-sm text-neutral-900 font-medium truncate">{session.email}</p>
                  <p className="text-xs text-neutral-500 capitalize">{session.role.replace('_', ' ')}</p>
                </div>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-3 text-neutral-500" />
                    Admin Console
                  </Link>
                )}
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors mt-1 border-t border-neutral-100"
                  onClick={async () => { 
                    setIsProfileOpen(false); 
                    await logoutAction(); 
                    window.location.href = "/auth/login"; 
                  }}
                >
                  <LogOut className="w-4 h-4 mr-3 text-red-500" />
                  Log out
                </button>
              </div>
            )}
          </div>

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
