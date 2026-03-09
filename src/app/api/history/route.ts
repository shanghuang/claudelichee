import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, products, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = db
    .select({
      productId: orderItems.productId,
      productName: products.name,
      productImage: products.image,
      productCategory: products.category,
      productStatus: products.status,
      sellerId: products.sellerId,
      sellerName: users.name,
      quantity: orderItems.quantity,
      orderedAt: orders.createdAt,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .leftJoin(products, eq(orderItems.productId, products.id))
    .leftJoin(users, eq(products.sellerId, users.id))
    .where(eq(orders.userId, parseInt(session.user.id)))
    .all();

  // Deduplicate by productId, keeping last ordered date and total quantity
  const map = new Map<number, {
    productId: number;
    productName: string | null;
    productImage: string | null;
    productCategory: string | null;
    productStatus: string | null;
    sellerId: number | null;
    sellerName: string | null;
    totalQuantity: number;
    lastOrderedAt: Date | null;
    timesOrdered: number;
  }>();

  for (const row of rows) {
    if (row.productId === null) continue;
    const existing = map.get(row.productId);
    if (!existing) {
      map.set(row.productId, {
        productId: row.productId,
        productName: row.productName,
        productImage: row.productImage,
        productCategory: row.productCategory,
        productStatus: row.productStatus,
        sellerId: row.sellerId ?? null,
        sellerName: row.sellerName,
        totalQuantity: row.quantity,
        lastOrderedAt: row.orderedAt,
        timesOrdered: 1,
      });
    } else {
      existing.totalQuantity += row.quantity;
      existing.timesOrdered += 1;
      if (row.orderedAt && (!existing.lastOrderedAt || row.orderedAt > existing.lastOrderedAt)) {
        existing.lastOrderedAt = row.orderedAt;
      }
    }
  }

  const result = Array.from(map.values()).sort((a, b) => {
    if (!a.lastOrderedAt) return 1;
    if (!b.lastOrderedAt) return -1;
    return b.lastOrderedAt.getTime() - a.lastOrderedAt.getTime();
  });

  return NextResponse.json(result);
}
