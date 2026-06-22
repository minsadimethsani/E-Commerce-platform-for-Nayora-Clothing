"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Database,
  ShieldCheck,
  Tags
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { logoutAction } from "../auth/actions";
import { SessionPayload } from "@/lib/auth";

const iconMap: Record<string, any> = {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Database,
  ShieldCheck,
  Tags
};

export default function AdminClientLayout({
  children,
  session,
  navLinks
}: {
  children: React.ReactNode;
  session: SessionPayload;
  navLinks: { href?: string, label: string, icon: string, submenu?: { href: string, label: string, icon: string }[] }[];
}) {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin/users") || pathname.startsWith("/admin/roles")) {
      setIsUsersOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("admin-theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      if (newTheme) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("admin-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("admin-theme", "light");
      }
      return newTheme;
    });
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 hidden md:flex flex-col h-screen sticky top-0 z-30">
        <div className="p-6">
          <Link href="/admin" className="text-2xl font-serif font-bold text-neutral-900 tracking-wider">
            NAYORA
            <span className="block font-sans font-medium text-neutral-400 text-xs mt-1 uppercase tracking-widest">
              Admin Console
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 mt-6 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            if (link.submenu) {
              const Icon = iconMap[link.icon] || Users;
              const hasActiveSub = link.submenu.some((sub: any) => pathname === sub.href);
              
              return (
                <div key={link.label} className="space-y-1">
                  <button
                    onClick={() => setIsUsersOpen(!isUsersOpen)}
                    type="button"
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer focus:outline-none ${
                      hasActiveSub
                        ? "bg-neutral-100 text-neutral-900"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`w-5 h-5 mr-3 ${hasActiveSub ? "text-neutral-950" : "text-neutral-400"}`} />
                      {link.label}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isUsersOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isUsersOpen && (
                    <div className="pl-6 space-y-1 mt-1 animate-in slide-in-from-top-1 duration-150">
                      {link.submenu.map((sub: any) => {
                        const isSubActive = pathname === sub.href;
                        const SubIcon = iconMap[sub.icon];
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={`flex items-center px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
                              isSubActive
                                ? "bg-neutral-900 text-white shadow-sm"
                                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                            }`}
                          >
                            {SubIcon && <SubIcon className={`w-4 h-4 mr-2.5 ${isSubActive ? "text-white" : "text-neutral-400"}`} />}
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = pathname === link.href;
            const Icon = iconMap[link.icon];
            return (
              <Link
                key={link.href}
                href={link.href!}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                {Icon && <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-white" : "text-neutral-400"}`} />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Profile Dropdown at bottom */}
        <div className="p-4 border-t border-neutral-200 relative" ref={profileRef}>
          <div
            className="flex items-center cursor-pointer group p-2 rounded-lg hover:bg-neutral-50 transition-colors"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="h-10 w-10 rounded-full bg-[#2C241E] flex items-center justify-center text-white font-bold uppercase border border-neutral-200 group-hover:border-neutral-300 transition-colors">
              {session.email[0]}
            </div>
            <div className="ml-3 flex-1 flex flex-col items-start overflow-hidden">
              <span className="text-sm font-semibold text-neutral-900 truncate w-full">{session.email}</span>
              <span className="text-xs text-neutral-500 truncate w-full capitalize">{session.role.replace('_', ' ')}</span>
            </div>
            <ChevronDown className={`ml-2 w-4 h-4 text-neutral-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </div>

          {isProfileOpen && (
            <div className="origin-bottom-left absolute left-4 bottom-20 w-56 rounded-xl shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none animate-in slide-in-from-bottom-2">
              <div className="px-4 py-3 border-b border-neutral-100">
                <p className="text-sm text-neutral-900 font-medium">{session.email}</p>
              </div>
              <Link
                href="/admin/settings"
                className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center transition-colors mt-1"
                onClick={() => setIsProfileOpen(false)}
              >
                <Settings className="w-4 h-4 mr-3 text-neutral-500" />
                Settings
              </Link>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors mb-1"
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
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative">
        <header className="md:hidden bg-white border-b border-neutral-200 sticky top-0 z-30 p-4 flex items-center justify-between">
          <Link href="/admin" className="text-xl font-serif font-bold text-neutral-900 tracking-wider">
            NAYORA
          </Link>
          <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Admin</div>
        </header>

        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-40 hidden md:block">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-neutral-900"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
          <div className="md:hidden flex justify-end mb-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-neutral-900"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
