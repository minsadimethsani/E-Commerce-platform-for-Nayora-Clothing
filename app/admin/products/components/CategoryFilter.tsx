"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Category } from "@/lib/category-db";

function CategoryFilterContent({ 
  currentCategory, 
  categories = [] 
}: { 
  currentCategory: string; 
  categories?: Category[]; 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const options = [
    { id: "all", label: "All Products" },
    ...categories.map((c) => ({ id: c.slug, label: c.name })),
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
        {options.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function CategoryFilter({ 
  currentCategory, 
  categories = [] 
}: { 
  currentCategory: string; 
  categories?: Category[]; 
}) {
  return (
    <Suspense fallback={<div className="h-10 w-40 bg-neutral-100 animate-pulse rounded-md"></div>}>
      <CategoryFilterContent currentCategory={currentCategory} categories={categories} />
    </Suspense>
  );
}
