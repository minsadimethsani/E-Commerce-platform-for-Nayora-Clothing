import { Suspense } from "react";
import { getProducts } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AddProductModal from "./components/AddProductModal";
import ProductsTable from "./components/ProductsTable";
import Pagination from "./components/Pagination";
import CategoryFilter from "./components/CategoryFilter";

import { getAllCategories } from "@/lib/category-db";

export default async function ManageProducts({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const category = resolvedSearchParams?.category || "all";

  const session = await getSession();
  if (session?.role !== "super_admin" && !session?.privileges?.includes("manage_products")) {
    redirect("/admin");
  }

  // Fetch categories dynamically
  const categories = await getAllCategories();

  // Simulate server-side fetch with pagination and filtering
  const { items, totalPages, totalItems } = await getProducts(category, currentPage);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-serif text-neutral-900">Manage Products</h1>
          <p className="mt-2 text-sm text-neutral-500">
            View, add, and remove products with server-side pagination.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 md:mr-16">
          <AddProductModal categories={categories} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl shadow-sm border border-neutral-100">
        <Suspense fallback={<div className="h-10 w-32 bg-neutral-100 animate-pulse rounded-md"></div>}>
          <CategoryFilter currentCategory={category} categories={categories} />
        </Suspense>
        <div className="mt-4 sm:mt-0 text-sm text-neutral-500 font-medium">
          Showing <span className="text-neutral-900">{items.length}</span> of <span className="text-neutral-900">{totalItems}</span> products
        </div>
      </div>

      <ProductsTable products={items} categories={categories} />

      {totalPages > 1 && (
        <Suspense fallback={<div className="h-10 w-full bg-neutral-100 animate-pulse rounded-md"></div>}>
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </Suspense>
      )}
    </div>
  );
}
