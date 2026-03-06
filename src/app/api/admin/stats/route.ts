import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { users, orders, orderItems, products } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET() {
  const session = await auth();

  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const totalUsers = db.select({ count: sql<number>`count(*)` }).from(users).get();
  const totalOrders = db.select({ count: sql<number>`count(*)` }).from(orders).get();
  const revenueResult = db.select({ total: sql<number>`coalesce(sum(total), 0)` }).from(orders).get();

  const pendingOrders = db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.status, 'pending'))
    .get();

  const recentOrders = db
    .select({
      id: orders.id,
      userName: users.name,
      userEmail: users.email,
      total: orders.total,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(sql`${orders.createdAt} desc`)
    .limit(5)
    .all();

  return NextResponse.json({
    totalUsers: totalUsers?.count ?? 0,
    totalOrders: totalOrders?.count ?? 0,
    totalRevenue: revenueResult?.total ?? 0,
    pendingOrders: pendingOrders?.count ?? 0,
    recentOrders,
  });
}
