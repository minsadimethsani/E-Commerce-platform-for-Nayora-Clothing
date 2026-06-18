import { notFound } from "next/navigation";
import ProductDetailsLayout from "@/components/ProductDetailsLayout";
import { getProductById, getProductsByCategory } from "@/lib/products";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Fetch product from backend helper
  const product = await getProductById(slug);

  if (!product) {
    notFound();
  }

  // Fetch related products using backend helper
  const categoryProducts = await getProductsByCategory(product.category);
  const relatedProducts = categoryProducts
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  return (
    <ProductDetailsLayout product={product} relatedProducts={relatedProducts} />
  );
}
