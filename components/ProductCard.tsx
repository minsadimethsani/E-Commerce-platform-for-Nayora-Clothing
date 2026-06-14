import Image from "next/image";
import Link from "next/link";
import { Product } from "@/data/cloths";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group flex flex-col relative">
      {product.tag && (
        <div className="absolute top-4 left-4 z-10 bg-cream/90 backdrop-blur-sm text-espresso text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 shadow-sm">
          {product.tag}
        </div>
      )}
      <Link href={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden mb-5 bg-espresso/5">
        <Image 
          src={product.image || "/hero.png"} 
          alt={product.name || "Product image"} 
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
  );
}
