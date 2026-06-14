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
    <section className="py-12 px-6 md:px-12 container mx-auto">
      <div className="flex justify-between items-end mb-12">
        <h2 className="text-3xl md:text-4xl font-serif text-espresso">Curated Categories</h2>
        <Link href="/collections" className="text-sm font-semibold uppercase tracking-widest border-b border-espresso pb-1 hover:text-olive hover:border-olive transition-colors hidden sm:block">
          View All
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/category/${cat.id}`} className="group flex flex-col block cursor-pointer">
            <div className="relative aspect-[3/4] overflow-hidden mb-6 bg-espresso/5">
              <Image src={cat.heroImage} alt={cat.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
            </div>
            <h3 className="text-xl font-serif mb-2">{cat.title}</h3>
            <span className="text-sm text-espresso/70 uppercase tracking-wider group-hover:text-olive transition-colors">Shop Now →</span>
          </Link>
        ))}
      </div>
      
      <div className="mt-12 text-center sm:hidden">
        <Link href="/collections" className="text-sm font-semibold uppercase tracking-widest border-b border-espresso pb-1 hover:text-olive hover:border-olive transition-colors">
          View All Categories
        </Link>
      </div>
    </section>
  );
}
