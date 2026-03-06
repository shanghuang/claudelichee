import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { like, eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  if (category) {
    const results = db
      .select()
      .from(products)
      .where(and(
        eq(products.category, category as 'tropical' | 'citrus' | 'berries' | 'melons' | 'stone' | 'other'),
        eq(products.status, 'approved')
      ))
      .all();
    return NextResponse.json(results);
  }

  if (search) {
    const results = db
      .select()
      .from(products)
      .where(and(
        like(products.name, `%${search}%`),
        eq(products.status, 'approved')
      ))
      .all();
    return NextResponse.json(results);
  }

  const results = db.select().from(products).where(eq(products.status, 'approved')).all();
  return NextResponse.json(results);
}
