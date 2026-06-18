import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default async function CuratedCategories() {
  const querySnapshot = await getDocs(collection(db, "categories"));
  const categories = querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as any))
    .filter(cat => cat.isActive)
    .slice(0, 3); // Display top 3 on homepage

  return (
    <section className="pt-12 pb-16 md:pt-16 md:pb-24 container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 px-4 md:px-0">
        <div>
          <span className="text-[#8C7162] uppercase tracking-[0.3em] text-xs font-bold mb-4 block">Collections</span>
          <h2 className="text-4xl md:text-5xl font-serif text-[#2C241E]">Curated Selections</h2>
        </div>
        <Link href="/collections" className="group hidden md:flex items-center gap-4 text-sm uppercase tracking-widest font-semibold text-[#2C241E] mt-6 md:mt-0">
          <span className="border-b border-transparent group-hover:border-[#8C7162] group-hover:text-[#8C7162] transition-colors pb-1">View Full Archive</span>
          <span className="w-8 h-[1px] bg-[#2C241E] group-hover:w-12 group-hover:bg-[#8C7162] transition-all duration-300"></span>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
        {categories.map((cat, index) => (
          <Link key={cat.id} href={`/category/${cat.id}`} className="group flex flex-col block cursor-pointer">
            <div className={`relative aspect-[3/4] overflow-hidden mb-8 bg-[#2C241E]/5 ${index === 1 ? 'md:mt-12 md:-mb-12' : ''}`}>
              <Image 
                src={cat.heroImage} 
                alt={cat.title} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out" 
              />
              <div className="absolute inset-0 bg-[#2C241E]/0 group-hover:bg-[#2C241E]/10 transition-colors duration-500"></div>
            </div>
            <div className={`flex items-center justify-between px-4 md:px-0 ${index === 1 ? 'md:mt-12' : ''}`}>
              <h3 className="text-2xl font-serif text-[#2C241E]">{cat.title}</h3>
              <span className="text-xs text-[#2C241E]/50 uppercase tracking-widest group-hover:text-[#8C7162] transition-colors duration-300">Explore</span>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-16 text-center md:hidden px-4">
        <Link href="/collections" className="inline-block border border-[#2C241E] px-8 py-4 text-xs font-bold uppercase tracking-widest text-[#2C241E] hover:bg-[#2C241E] hover:text-[#FAF9F6] transition-colors w-full">
          View Full Archive
        </Link>
      </div>
    </section>
  );
}
