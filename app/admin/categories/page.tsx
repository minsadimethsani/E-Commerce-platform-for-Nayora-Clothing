import { getSession } from "@/lib/auth";
import { getAllCategories } from "@/lib/category-db";
import { redirect } from "next/navigation";
import CategoriesList from "./CategoriesList";
import CategoryModal from "./CategoryModal";

export default async function CategoryManagement() {
  const session = await getSession();

  // Authorize: Category management is available to users who can manage products
  const hasProductsPrivilege = session?.privileges?.includes("manage_products");
  if (session?.role !== "super_admin" && !hasProductsPrivilege) {
    redirect("/admin");
  }

  const categories = await getAllCategories();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-serif text-neutral-900">Category Management</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Define dynamic product categories and subcategories to structure the storefront inventory catalog.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 md:mr-16">
          <CategoryModal />
        </div>
      </div>

      <CategoriesList categories={categories} />
    </div>
  );
}
