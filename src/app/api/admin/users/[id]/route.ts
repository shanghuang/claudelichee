import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { users, orders } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const targetId = parseInt(id);

  if (parseInt(session.user.id) === targetId) {
    return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
  }

  const { role } = await request.json();

  if (role !== 'user' && role !== 'admin') {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  db.update(users).set({ role }).where(eq(users.id, targetId)).run();

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const targetId = parseInt(id);

  if (parseInt(session.user.id) === targetId) {
    return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
  }

  const orderCount = db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.userId, targetId))
    .get();

  if (orderCount && orderCount.count > 0) {
    return NextResponse.json({ error: 'Cannot delete user with existing orders' }, { status: 400 });
  }

  db.delete(users).where(eq(users.id, targetId)).run();

  return NextResponse.json({ success: true });
}
