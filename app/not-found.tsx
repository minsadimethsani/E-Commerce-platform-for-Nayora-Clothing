import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-cream text-espresso px-6 text-center">
      <span className="text-espresso/30 font-serif text-[12rem] leading-none mb-4 block tracking-tighter">404</span>
      <h1 className="text-3xl md:text-5xl font-serif font-bold mb-6 tracking-tight">Page Not Found</h1>
      <p className="text-espresso/70 max-w-md mx-auto mb-12 text-lg font-light">
        The page you are looking for has been moved or no longer exists. Return to our curated collections to continue exploring.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-sm">
        <Link 
          href="/" 
          className="px-8 py-4 bg-espresso text-cream text-sm uppercase tracking-widest font-bold hover:bg-espresso/90 transition-colors w-full sm:w-auto"
        >
          Return Home
        </Link>
        <Link 
          href="/collections" 
          className="px-8 py-4 border border-espresso text-espresso text-sm uppercase tracking-widest font-bold hover:bg-espresso/5 transition-colors w-full sm:w-auto"
        >
          Collections
        </Link>
      </div>
    </div>
  );
}
