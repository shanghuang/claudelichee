import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sellerFollows, productTimeline, products, users } from '@/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const buyerId = parseInt(session.user.id);

  const follows = db
    .select({ sellerId: sellerFollows.sellerId })
    .from(sellerFollows)
    .where(eq(sellerFollows.buyerId, buyerId))
    .all();

  if (follows.length === 0) {
    return NextResponse.json([]);
  }

  const sellerIds = follows.map(f => f.sellerId);

  const entries = db
    .select({
      id: productTimeline.id,
      content: productTimeline.content,
      image: productTimeline.image,
      createdAt: productTimeline.createdAt,
      productId: productTimeline.productId,
      productName: products.name,
      sellerId: productTimeline.sellerId,
      sellerName: users.name,
    })
    .from(productTimeline)
    .leftJoin(products, eq(productTimeline.productId, products.id))
    .leftJoin(users, eq(productTimeline.sellerId, users.id))
    .where(inArray(productTimeline.sellerId, sellerIds))
    .orderBy(desc(productTimeline.createdAt))
    .all();

  return NextResponse.json(entries);
}
