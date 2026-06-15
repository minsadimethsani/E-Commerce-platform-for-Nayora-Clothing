"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function OrdersFilter({ currentStatus }: { currentStatus: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const statuses = [
    { id: "all", label: "All Orders" },
    { id: "pending", label: "Pending" },
    { id: "processing", label: "Processing" },
    { id: "shipped", label: "Shipped" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", e.target.value);
    params.set("page", "1"); // Reset to page 1 on filter change
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="status-filter" className="text-sm font-medium text-neutral-700">
        Filter by:
      </label>
      <select
        id="status-filter"
        value={currentStatus}
        onChange={handleStatusChange}
        className="block w-40 pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-neutral-500 focus:border-neutral-500 sm:text-sm rounded-md border bg-white"
      >
        {statuses.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
