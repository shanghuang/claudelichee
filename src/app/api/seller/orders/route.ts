import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { products, orderItems, orders, users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'seller') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const sellerId = parseInt(session.user.id);

  const sellerProducts = db
    .select({ id: products.id, name: products.name })
    .from(products)
    .where(eq(products.sellerId, sellerId))
    .all();

  const productIds = sellerProducts.map(p => p.id);
  const productNameMap = Object.fromEntries(sellerProducts.map(p => [p.id, p.name]));

  if (productIds.length === 0) {
    return NextResponse.json([]);
  }

  const allOrderItems = db
    .select({
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      price: orderItems.price,
    })
    .from(orderItems)
    .all();

  const sellerOrderItems = allOrderItems.filter(item => productIds.includes(item.productId));
  const sellerOrderIds = [...new Set(sellerOrderItems.map(item => item.orderId))];

  if (sellerOrderIds.length === 0) {
    return NextResponse.json([]);
  }

  const allOrders = db
    .select({
      id: orders.id,
      userId: orders.userId,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
      buyerName: users.name,
      buyerEmail: users.email,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .all();

  const sellerOrders = allOrders
    .filter(order => sellerOrderIds.includes(order.id))
    .map(order => {
      const items = sellerOrderItems
        .filter(item => item.orderId === order.id)
        .map(item => ({
          productId: item.productId,
          productName: productNameMap[item.productId] ?? 'Unknown',
          quantity: item.quantity,
          price: item.price,
        }));

      const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

      return {
        ...order,
        items,
        subtotal,
      };
    });

  return NextResponse.json(sellerOrders);
}
