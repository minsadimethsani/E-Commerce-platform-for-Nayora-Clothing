import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { getSession } from "@/lib/auth";
import { getAllProducts } from "@/lib/products";

export default async function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const products = await getAllProducts();

  return (
    <CartProvider>
      <Header session={session} products={products} />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </CartProvider>
  );
}
