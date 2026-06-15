"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CategoryFilterContent({ currentCategory }: { currentCategory: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categories = [
    { id: "all", label: "All Products" },
    { id: "women", label: "Women" },
    { id: "men", label: "Men" },
    { id: "accessories", label: "Accessories" },
    { id: "unisex", label: "Unisex" },
  ];

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", e.target.value);
    params.set("page", "1"); // Reset to page 1 on category change
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="category-filter" className="text-sm font-medium text-neutral-700">
        Filter by:
      </label>
      <select
        id="category-filter"
        value={currentCategory}
        onChange={handleCategoryChange}
        className="block w-40 pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-neutral-500 focus:border-neutral-500 sm:text-sm rounded-md border"
      >
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function CategoryFilter({ currentCategory }: { currentCategory: string }) {
  return (
    <Suspense fallback={<div className="h-10 w-40 bg-neutral-100 animate-pulse rounded-md"></div>}>
      <CategoryFilterContent currentCategory={currentCategory} />
    </Suspense>
  );
}
