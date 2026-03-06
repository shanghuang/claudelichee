import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const productId = parseInt(id);

  const product = db.select().from(products).where(eq(products.id, productId)).get();

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  try {
    const { status } = await request.json();

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    db.update(products)
      .set({ status })
      .where(eq(products.id, productId))
      .run();

    return NextResponse.json({ message: `Product ${status}` });
  } catch (error) {
    console.error('Update product status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
