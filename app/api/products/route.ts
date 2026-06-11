import { NextResponse } from 'next/server';
import { getPaginatedProducts } from '@/lib/products';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const category = searchParams.get('category') || 'All';
  const query = searchParams.get('query') || '';
  const sort = searchParams.get('sort') || 'Featured';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '9', 10);

  try {
    const data = await getPaginatedProducts({
      category,
      query,
      sort,
      page,
      limit
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
