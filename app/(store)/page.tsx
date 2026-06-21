import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import HeroSlideshow from "@/components/HeroSlideshow";
import NewsletterForm from "@/components/NewsletterForm";

export default async function Home() {
  const allProducts = await getAllProducts();

  // Find products used in the hero slideshow (first 4 with images)
  const heroSlideProducts = allProducts.filter((p) => p.image).slice(0, 4);
  const heroSlideIds = heroSlideProducts.map((p) => String(p.id));

  // Sort products dynamically by creation time (newest first)
  const sortedProducts = [...allProducts].sort((a, b) => {
    const aTime = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
    const bTime = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
    return bTime - aTime;
  });

  // Take the first 4 products as New Arrivals, excluding the ones in the hero slideshow
  const newArrivals = sortedProducts
    .filter((p) => !heroSlideIds.includes(String(p.id)))
    .slice(0, 4);

  const inStockNotHeroProducts = allProducts.filter((p) => {
    const isInStock = (p as any).quantity > 0 || (p.variants && p.variants.some((v: any) => v.stock_quantity > 0));
    return p.image && isInStock && !heroSlideIds.includes(String(p.id));
  });

  const craftSectionProduct = inStockNotHeroProducts.length > 0 
    ? inStockNotHeroProducts[0] 
    : null;
  const craftSectionImage = craftSectionProduct ? craftSectionProduct.image : "/brand-story.png";

  return (
    <div className="flex flex-col w-full bg-[#FAF9F6] text-[#2C241E] overflow-hidden">
      {/* Editorial Hero Section - Full Width Slideshow */}
      <HeroSlideshow products={allProducts} />


      {/* Featured Statement / Manifesto */}

      {/* New Arrivals Section */}
      <section className="pt-12 pb-6 md:pt-16 md:pb-8 container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 px-4 md:px-0">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif text-[#2C241E]">New Arrivals</h2>
          </div>
          <Link href="/new-arrivals" className="group flex items-center gap-4 text-sm uppercase tracking-widest font-semibold text-[#2C241E] mt-6 md:mt-0">
            <span className="border-b border-transparent group-hover:border-[#8C7162] group-hover:text-[#8C7162] transition-colors pb-1">View All Arrivals</span>
            <span className="w-8 h-[1px] bg-[#2C241E] group-hover:w-12 group-hover:bg-[#8C7162] transition-all duration-300"></span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      <section className="pt-6 pb-16 md:pt-8 md:pb-20 px-6 md:px-12 max-w-5xl mx-auto flex flex-col items-center justify-center text-center">
        <span className="text-[#8C7162] uppercase tracking-[0.3em] text-xs font-bold mb-8">Our Philosophy</span>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif leading-[1.3] text-[#2C241E]">
          "We believe in the power of <span className="italic text-[#8C7162]">understated elegance</span>. Every piece is a dialogue between form, fabric, and the wearer."
        </h2>
      </section>
      {/* Brand Value Section - Asymmetrical Layout */}
      <section className="py-16 md:py-24 bg-[#FAF9F6]">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-center">

            <div className="md:col-span-5 md:col-start-2 relative aspect-[3/4] md:aspect-[4/5] rounded-tl-[4rem] rounded-br-[4rem] overflow-hidden shadow-2xl">
              {craftSectionProduct ? (
                <Link href={`/product/${craftSectionProduct.id}`}>
                  <Image
                    src={craftSectionImage}
                    alt={craftSectionProduct.name}
                    fill
                    className="object-cover object-center hover:scale-110 transition-transform duration-[1.5s] ease-out cursor-pointer"
                  />
                </Link>
              ) : (
                <Image
                  src={craftSectionImage}
                  alt="Nayora Craftsmanship"
                  fill
                  className="object-cover object-center hover:scale-110 transition-transform duration-[1.5s] ease-out"
                />
              )}
            </div>

            <div className="md:col-span-5 md:col-start-8 flex flex-col justify-center">
              <span className="text-[#8C7162] uppercase tracking-[0.3em] text-xs font-bold mb-6">The Craft</span>
              <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-tight text-[#2C241E]">
                Artistry in <br /> <span className="italic text-[#8C7162]">Every Stitch</span>
              </h2>
              <p className="text-[#2C241E]/70 text-lg mb-10 leading-relaxed font-light">
                Our materials are hand-selected from the most responsible mills across the globe. We prioritize organic fibers and ethical production, ensuring that your wardrobe not only looks exquisite but aligns with a sustainable future.
              </p>
              <div>
                <Link href="/about" className="group inline-flex items-center gap-4 text-sm uppercase tracking-widest font-semibold text-[#2C241E]">
                  <span className="border-b border-[#2C241E] pb-1 group-hover:border-[#8C7162] group-hover:text-[#8C7162] transition-colors">Discover Our Story</span>
                  <span className="w-8 h-[1px] bg-[#2C241E] group-hover:w-12 group-hover:bg-[#8C7162] transition-all duration-300"></span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Newsletter / Closing Section */}
      <section className="py-16 md:py-24 bg-[#2C241E] text-[#FAF9F6] text-center px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-serif mb-6">Join The Inner Circle</h2>
          <p className="text-[#FAF9F6]/70 mb-10 font-light text-lg">Subscribe to receive early access to new collections, exclusive events, and editorial content.</p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
