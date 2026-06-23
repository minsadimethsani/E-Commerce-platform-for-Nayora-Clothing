import { NextResponse } from 'next/server';
import { getAllCategories } from '@/lib/category-db';

export async function GET() {
  try {
    const categories = await getAllCategories();
    // Return only active categories
    const activeCategories = categories.filter(c => c.isActive);
    return NextResponse.json(activeCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
