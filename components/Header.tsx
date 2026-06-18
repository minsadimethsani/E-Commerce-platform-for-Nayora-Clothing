"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useEffect, useState, useRef } from 'react';
import { User, LogOut, LayoutDashboard } from 'lucide-react';
import { logoutAction } from '@/app/auth/actions';
import Image from 'next/image';

interface MegamenuColumn {
  title: string;
  links: { label: string; href: string }[];
}

interface MegamenuItem {
  image: string;
  imageAlt: string;
  imageCaption: string;
  columns: MegamenuColumn[];
}

const MEGAMENU_DATA: Record<string, MegamenuItem> = {
  women: {
    image: "/women.png",
    imageAlt: "Women's Collection",
    imageCaption: "Sophisticated Silhouettes",
    columns: [
      {
        title: "APPAREL",
        links: [
          { label: "DRESSES", href: "/category/women/partywear" },
          { label: "TOP & BLOUSE", href: "/search?q=blouse" },
          { label: "CROP TOPS", href: "/search?q=crop+top" },
          { label: "SKIRTS", href: "/category/women/casual" },
          { label: "BLAZERS", href: "/search?q=blazer" },
        ]
      },
      {
        title: "COLLECTIONS",
        links: [
          { label: "CASUAL EDIT", href: "/category/women/casual" },
          { label: "FORMAL EDIT", href: "/category/women/formal" },
          { label: "PARTYWEAR", href: "/category/women/partywear" },
          { label: "LOUNGEWEAR", href: "/category/women/loungewear" },
        ]
      },
      {
        title: "ACCESSORIES",
        links: [
          { label: "HAND BAGS", href: "/category/accessories/bags" },
          { label: "JEWELLERY", href: "/category/accessories/jewelry" },
          { label: "EYEWEAR", href: "/category/accessories/eyewear" },
          { label: "ACCENTS", href: "/category/accessories/accents" },
        ]
      }
    ]
  },
  men: {
    image: "/men.png",
    imageAlt: "Men's Collection",
    imageCaption: "Tailored Essentials",
    columns: [
      {
        title: "APPAREL",
        links: [
          { label: "SUITS & BLAZERS", href: "/search?q=blazer" },
          { label: "TROUSERS", href: "/search?q=trousers" },
          { label: "KNITWEAR & SWEATERS", href: "/search?q=sweater" },
          { label: "SHIRTS & TEES", href: "/search?q=tee" },
        ]
      },
      {
        title: "COLLECTIONS",
        links: [
          { label: "CASUAL EDIT", href: "/category/men/casual" },
          { label: "FORMAL EDIT", href: "/category/men/formal" },
          { label: "LOUNGEWEAR", href: "/category/men/loungewear" },
        ]
      },
      {
        title: "ACCESSORIES",
        links: [
          { label: "BAGS", href: "/category/accessories/bags" },
          { label: "EYEWEAR", href: "/category/accessories/eyewear" },
          { label: "FOOTWEAR", href: "/search?q=boots" },
        ]
      }
    ]
  },
  accessories: {
    image: "/accessories.png",
    imageAlt: "Accessories Collection",
    imageCaption: "Timeless Accents",
    columns: [
      {
        title: "LEATHER GOODS",
        links: [
          { label: "TOTE BAGS", href: "/search?q=tote" },
          { label: "SATCHELS", href: "/search?q=satchel" },
          { label: "HAND BAGS", href: "/category/accessories/bags" },
        ]
      },
      {
        title: "ACCENTS & JEWELRY",
        links: [
          { label: "FINE JEWELLERY", href: "/category/accessories/jewelry" },
          { label: "GOLD NECKLACES", href: "/search?q=necklace" },
          { label: "SILK SCARVES", href: "/search?q=scarf" },
        ]
      },
      {
        title: "LIFESTYLE",
        links: [
          { label: "EYEWEAR", href: "/category/accessories/eyewear" },
          { label: "SUNGLASSES", href: "/search?q=sunglasses" },
          { label: "BOOTS & FOOTWEAR", href: "/search?q=boots" },
        ]
      }
    ]
  }
};

const NAV_ITEMS = [
  { label: "HOME", href: "/" },
  { label: "SHOP", href: "/collections" },
  { label: "WOMEN", href: "/category/women", hasMegamenu: true, key: "women" },
  { label: "MEN", href: "/category/men", hasMegamenu: true, key: "men" },
  { label: "ACCESSORIES", href: "/category/accessories", hasMegamenu: true, key: "accessories" },
  { label: "NEW ARRIVALS", href: "/new-arrivals" },
  { label: "OUR STORY", href: "/about" },
];

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

  // Megamenu Hover State management
  const [isMegamenuHovered, setIsMegamenuHovered] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (key: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsMegamenuHovered(true);
    setActiveCategory(key);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsMegamenuHovered(false);
      setActiveCategory(null);
    }, 180); // Slight delay for seamless transition
  };

  const handleMegamenuMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsMegamenuHovered(true);
  };

  const handleMegamenuMouseLeave = () => {
    handleMouseLeave();
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

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
    <div className="w-full sticky top-4 z-50 px-4 md:px-6 pointer-events-none">
      <header className="max-w-7xl mx-auto bg-cream/90 backdrop-blur-md border border-espresso/10 rounded-full shadow-lg h-16 flex items-center justify-between pointer-events-auto transition-all duration-300 relative px-6 md:px-8 hover:shadow-xl">
        
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="text-xl md:text-2xl font-serif font-bold tracking-[0.2em] text-espresso hover:text-olive transition-colors">
            NAYORA
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-[12px] font-semibold uppercase tracking-[0.18em]">
          {NAV_ITEMS.map((item) => {
            const isHovered = activeCategory === item.key;
            const isActive = pathname === item.href || (item.key && pathname.startsWith(`/category/${item.key}`));
            return (
              <div
                key={item.label}
                className="relative py-5 cursor-pointer"
                onMouseEnter={() => {
                  if (item.hasMegamenu && item.key) {
                    handleMouseEnter(item.key);
                  } else {
                    handleMouseLeave();
                  }
                }}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={item.href}
                  className={`transition-colors duration-200 hover:text-olive ${
                    isActive ? "text-olive font-bold" : "text-espresso/80"
                  }`}
                >
                  {item.label}
                </Link>
                {/* Visual indicator bar under hovered / active nav item */}
                <span className={`absolute bottom-3 left-0 right-0 h-[2px] bg-olive transition-transform duration-300 origin-left ${
                  isHovered || isActive ? "scale-x-100" : "scale-x-0"
                }`} />
              </div>
            );
          })}
        </nav>

        {/* Right: Icons */}
        <div className="flex items-center gap-5 md:gap-6 text-espresso flex-shrink-0">
          {/* Search Toggle */}
          {isSearchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center border-b border-espresso/45 pb-1 animate-[fadeIn_0.2s_ease-out]">
              <input 
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-xs text-espresso placeholder:text-espresso/40 w-24 md:w-40"
              />
              <button type="button" onClick={() => setIsSearchOpen(false)} className="ml-2 text-espresso/50 hover:text-espresso cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </form>
          ) : (
            <button aria-label="Search" onClick={() => setIsSearchOpen(true)} className="hover:text-olive transition-colors cursor-pointer flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
          )}
          
          {/* User Profile */}
          <div className="relative flex items-center justify-center" ref={profileRef}>
            {session ? (
              <button 
                aria-label="Profile" 
                onClick={() => setIsProfileOpen(!isProfileOpen)} 
                className="hover:text-olive transition-colors flex items-center cursor-pointer"
              >
                <User size={20} strokeWidth={1.5} />
              </button>
            ) : (
              <Link href="/auth/login" aria-label="Login" className="hover:text-olive transition-colors flex items-center">
                <User size={20} strokeWidth={1.5} />
              </Link>
            )}

            {isProfileOpen && session && (
              <div className="absolute right-0 top-full mt-3 w-48 rounded-xl shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none animate-in slide-in-from-top-2 z-[60]">
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
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors mt-1 border-t border-neutral-100 cursor-pointer"
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

          {/* Cart link */}
          <Link href="/cart" aria-label="Cart" className="hover:text-olive transition-colors relative flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-olive text-cream text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Floating Megamenu Dropdown Card */}
        <div 
          onMouseEnter={handleMegamenuMouseEnter}
          onMouseLeave={handleMegamenuMouseLeave}
          className={`absolute top-[calc(100%+0.75rem)] left-0 right-0 mx-auto w-full max-w-5xl bg-cream/95 backdrop-blur-md border border-espresso/15 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 transform origin-top z-50 pointer-events-auto ${
            isMegamenuHovered && activeCategory && MEGAMENU_DATA[activeCategory]
              ? "opacity-100 scale-100 translate-y-0 visible" 
              : "opacity-0 scale-95 -translate-y-2 invisible pointer-events-none"
          }`}
        >
          {activeCategory && MEGAMENU_DATA[activeCategory] && (
            <div className="flex gap-8 p-8 text-espresso">
              {/* Left Column: Featured Image */}
              <div className="w-[280px] shrink-0 relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md group">
                <Image 
                  src={MEGAMENU_DATA[activeCategory].image} 
                  alt={MEGAMENU_DATA[activeCategory].imageAlt} 
                  fill
                  sizes="280px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-espresso/10 to-transparent flex flex-col justify-end p-5">
                  <span className="text-[10px] text-cream/70 font-semibold tracking-[0.2em] uppercase mb-1">Featured</span>
                  <span className="text-cream text-lg font-serif font-semibold tracking-wide leading-tight">
                    {MEGAMENU_DATA[activeCategory].imageCaption}
                  </span>
                </div>
              </div>

              {/* Right Column: Detailed 3-Column Subcategories List */}
              <div className="flex-1 grid grid-cols-3 gap-8 pt-2">
                {MEGAMENU_DATA[activeCategory].columns.map((column, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-4">
                    <h4 className="text-[11px] font-bold text-espresso tracking-[0.2em] uppercase border-b border-espresso/10 pb-2">
                      {column.title}
                    </h4>
                    <ul className="flex flex-col gap-3">
                      {column.links.map((link, linkIdx) => (
                        <li key={linkIdx}>
                          <Link 
                            href={link.href}
                            onClick={() => {
                              setIsMegamenuHovered(false);
                              setActiveCategory(null);
                            }}
                            className="text-[13px] text-espresso/70 hover:text-olive transition-colors font-medium tracking-wide"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </header>
    </div>
  );
}
