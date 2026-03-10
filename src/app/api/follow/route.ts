import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sellerFollows } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const buyerId = parseInt(session.user.id);
  const rows = db
    .select({ sellerId: sellerFollows.sellerId })
    .from(sellerFollows)
    .where(eq(sellerFollows.buyerId, buyerId))
    .all();

  return NextResponse.json(rows.map(r => r.sellerId));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sellerId } = await req.json();
  if (!sellerId) {
    return NextResponse.json({ error: 'sellerId required' }, { status: 400 });
  }

  const buyerId = parseInt(session.user.id);

  const existing = db
    .select()
    .from(sellerFollows)
    .where(and(eq(sellerFollows.buyerId, buyerId), eq(sellerFollows.sellerId, sellerId)))
    .get();

  if (!existing) {
    db.insert(sellerFollows).values({ buyerId, sellerId }).run();
  }

  return NextResponse.json({ following: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sellerId } = await req.json();
  if (!sellerId) {
    return NextResponse.json({ error: 'sellerId required' }, { status: 400 });
  }

  const buyerId = parseInt(session.user.id);

  db.delete(sellerFollows)
    .where(and(eq(sellerFollows.buyerId, buyerId), eq(sellerFollows.sellerId, sellerId)))
    .run();

  return NextResponse.json({ following: false });
}
