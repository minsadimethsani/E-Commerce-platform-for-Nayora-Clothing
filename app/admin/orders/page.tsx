import { Suspense } from "react";
import { getOrders } from "@/lib/db";
import OrdersTable from "./components/OrdersTable";
import OrdersFilter from "./components/OrdersFilter";
import Pagination from "../products/components/Pagination"; // Reusing the pagination component

export default async function ManageOrders({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const statusFilter = resolvedSearchParams?.status || "all";

  // Server-side fetch with pagination and filtering
  const { items, totalPages, totalItems } = await getOrders(statusFilter, currentPage);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-serif text-neutral-900">Manage Orders</h1>
          <p className="mt-2 text-sm text-neutral-500">
            View customer orders, update statuses, and check payment methods.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl shadow-sm border border-neutral-100">
        <Suspense fallback={<div className="h-10 w-32 bg-neutral-100 animate-pulse rounded-md"></div>}>
          <OrdersFilter currentStatus={statusFilter} />
        </Suspense>
        <div className="mt-4 sm:mt-0 text-sm text-neutral-500 font-medium">
          Showing <span className="text-neutral-900">{items.length}</span> of <span className="text-neutral-900">{totalItems}</span> orders
        </div>
      </div>

      <OrdersTable orders={items} />

      {totalPages > 1 && (
        <Suspense fallback={<div className="h-10 w-full bg-neutral-100 animate-pulse rounded-md"></div>}>
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </Suspense>
      )}
    </div>
  );
}
