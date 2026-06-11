import { cloths, Product } from "@/data/cloths";

// Helper to simulate a network delay for realistic backend behavior
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 500));

export async function getAllProducts(): Promise<Product[]> {
  await simulateDelay();
  return cloths;
}

export async function getProductById(slug: string): Promise<Product | undefined> {
  await simulateDelay();
  return cloths.find((p) => p.id === slug);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  await simulateDelay();
  if (category.toLowerCase() === 'all') return cloths;
  return cloths.filter((p) => p.category.toLowerCase() === category.toLowerCase());
}

export interface GetProductsOptions {
  category?: string;
  query?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function getPaginatedProducts(options: GetProductsOptions) {
  await simulateDelay();

  let result = [...cloths];

  // 1. Filter by category
  if (options.category && options.category.toLowerCase() !== 'all') {
    result = result.filter(p => p.category.toLowerCase() === options.category!.toLowerCase());
  }

  // 2. Search query
  if (options.query) {
    const q = options.query.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  // 3. Sort
  if (options.sort) {
    switch (options.sort) {
      case 'Price: Low to High':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'Newest Arrivals':
        // Just reverse to mock newest
        result.reverse();
        break;
      // Default: Featured (no sort change needed)
    }
  }

  // 4. Pagination
  const page = options.page || 1;
  const limit = options.limit || 9;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedResult = result.slice(startIndex, endIndex);

  return {
    products: paginatedResult,
    total: result.length,
    page,
    totalPages: Math.ceil(result.length / limit)
  };
}
