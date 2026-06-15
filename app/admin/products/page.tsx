import { getProducts } from "@/lib/db";
import AddProductModal from "./components/AddProductModal";
import ProductsTable from "./components/ProductsTable";
import Pagination from "./components/Pagination";
import CategoryFilter from "./components/CategoryFilter";

export default async function ManageProducts({
  searchParams,
}: {
  searchParams: { page?: string; category?: string };
}) {
  const currentPage = Number(searchParams?.page) || 1;
  const category = searchParams?.category || "all";

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
        <div className="mt-4 sm:mt-0">
          <AddProductModal />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl shadow-sm border border-neutral-100">
        <CategoryFilter currentCategory={category} />
        <div className="mt-4 sm:mt-0 text-sm text-neutral-500 font-medium">
          Showing <span className="text-neutral-900">{items.length}</span> of <span className="text-neutral-900">{totalItems}</span> products
        </div>
      </div>

      <ProductsTable products={items} />

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </div>
  );
}
