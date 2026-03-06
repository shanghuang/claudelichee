import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { products, orderItems, orders } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'seller') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const sellerId = parseInt(session.user.id);

  const sellerProducts = db
    .select()
    .from(products)
    .where(eq(products.sellerId, sellerId))
    .all();

  const totalProducts = sellerProducts.length;
  const approvedCount = sellerProducts.filter(p => p.status === 'approved').length;
  const pendingCount = sellerProducts.filter(p => p.status === 'pending').length;
  const rejectedCount = sellerProducts.filter(p => p.status === 'rejected').length;

  const productIds = sellerProducts.map(p => p.id);

  let totalUnitsSold = 0;
  let totalRevenue = 0;
  const productRevenue: Record<number, { name: string; units: number; revenue: number }> = {};

  if (productIds.length > 0) {
    const salesData = db
      .select({
        productId: orderItems.productId,
        units: sql<number>`sum(${orderItems.quantity})`,
        revenue: sql<number>`sum(${orderItems.quantity} * ${orderItems.price})`,
      })
      .from(orderItems)
      .groupBy(orderItems.productId)
      .all();

    for (const sale of salesData) {
      if (productIds.includes(sale.productId)) {
        totalUnitsSold += sale.units;
        totalRevenue += sale.revenue;
        productRevenue[sale.productId] = {
          name: sellerProducts.find(p => p.id === sale.productId)?.name ?? '',
          units: sale.units,
          revenue: sale.revenue,
        };
      }
    }
  }

  const topProducts = Object.entries(productRevenue)
    .map(([id, data]) => ({ id: parseInt(id), ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3);

  return NextResponse.json({
    totalProducts,
    approvedCount,
    pendingCount,
    rejectedCount,
    totalUnitsSold,
    totalRevenue,
    topProducts,
  });
}
