import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, users } from '@/db/schema';
import { like, eq, and } from 'drizzle-orm';

const withSeller = db
  .select({
    id: products.id,
    name: products.name,
    description: products.description,
    price: products.price,
    image: products.image,
    category: products.category,
    stock: products.stock,
    unit: products.unit,
    sellerId: products.sellerId,
    sellerName: users.name,
    status: products.status,
  })
  .from(products)
  .leftJoin(users, eq(products.sellerId, users.id));

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const sellerId = searchParams.get('sellerId');

  if (sellerId) {
    const results = withSeller
      .where(and(eq(products.sellerId, parseInt(sellerId)), eq(products.status, 'approved')))
      .all();
    return NextResponse.json(results);
  }

  if (category) {
    const results = withSeller
      .where(and(
        eq(products.category, category as 'tropical' | 'citrus' | 'berries' | 'melons' | 'stone' | 'other'),
        eq(products.status, 'approved')
      ))
      .all();
    return NextResponse.json(results);
  }

  if (search) {
    const results = withSeller
      .where(and(
        like(products.name, `%${search}%`),
        eq(products.status, 'approved')
      ))
      .all();
    return NextResponse.json(results);
  }

  const results = withSeller.where(eq(products.status, 'approved')).all();
  return NextResponse.json(results);
}
