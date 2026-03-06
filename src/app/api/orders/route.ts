import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userOrders = db
    .select()
    .from(orders)
    .where(eq(orders.userId, parseInt(session.user.id)))
    .orderBy(orders.createdAt)
    .all()
    .reverse();

  // Get order items for each order
  const ordersWithItems = userOrders.map((order) => {
    const items = db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        price: orderItems.price,
        productId: orderItems.productId,
        productName: products.name,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id))
      .all();

    return { ...order, items };
  });

  return NextResponse.json(ordersWithItems);
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { items, shippingAddress, total } = await request.json();

    if (!items || !shippingAddress || total === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create order
    const orderResult = db
      .insert(orders)
      .values({
        userId: parseInt(session.user.id),
        total,
        shippingAddress,
        status: 'pending',
      })
      .run();

    const orderId = Number(orderResult.lastInsertRowid);

    // Create order items
    for (const item of items) {
      db.insert(orderItems)
        .values({
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })
        .run();
    }

    return NextResponse.json(
      { message: 'Order created successfully', orderId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
