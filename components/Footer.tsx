import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-espresso/10 bg-cream text-espresso mt-auto">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div>
            <h3 className="font-serif font-bold text-2xl tracking-widest mb-6">NAYORA</h3>
            <p className="text-sm text-espresso/70 leading-relaxed">
              Redefining minimalism with elegant earth tones and premium fabrics for the modern lifestyle.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-6 uppercase tracking-wider text-sm">Shop</h4>
            <ul className="space-y-4 text-sm text-espresso/80">
              <li><Link href="/collections" className="hover:text-olive transition-colors">Women's Collection</Link></li>
              <li><Link href="/new-arrivals" className="hover:text-olive transition-colors">Men's Collection</Link></li>
              <li><Link href="/bestsellers" className="hover:text-olive transition-colors">Accessories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-6 uppercase tracking-wider text-sm">Support</h4>
            <ul className="space-y-4 text-sm text-espresso/80">
              <li><Link href="/faq" className="hover:text-olive transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-olive transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/contact" className="hover:text-olive transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-6 uppercase tracking-wider text-sm">Newsletter</h4>
            <p className="text-sm text-espresso/70 mb-6">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <div className="flex gap-0 border-b border-espresso/30 pb-2 focus-within:border-olive transition-colors">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="w-full bg-transparent text-sm focus:outline-none placeholder:text-espresso/40"
              />
              <button className="text-sm font-semibold uppercase tracking-wider hover:text-olive transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-espresso/10 text-center text-sm text-espresso/50">
          <p>&copy; {new Date().getFullYear()} Nayora Clothing. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
