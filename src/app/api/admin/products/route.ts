import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { products, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const statusFilter = searchParams.get('status');

  const allProducts = db
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
      status: products.status,
      sellerName: users.name,
      sellerEmail: users.email,
    })
    .from(products)
    .leftJoin(users, eq(products.sellerId, users.id))
    .all();

  const filtered = statusFilter === 'all'
    ? allProducts
    : allProducts.filter(p => p.sellerId !== null && p.status === 'pending');

  return NextResponse.json(filtered);
}
