import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { products, orderItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'seller') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const productId = parseInt(id);
  const sellerId = parseInt(session.user.id);

  const product = db.select().from(products).where(eq(products.id, productId)).get();

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  if (product.sellerId !== sellerId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const formData = await request.formData();

    const name = formData.get('name') as string | null;
    const description = formData.get('description') as string | null;
    const price = formData.get('price') as string | null;
    const category = formData.get('category') as string | null;
    const stock = formData.get('stock') as string | null;
    const unit = formData.get('unit') as string | null;
    const imageFile = formData.get('image') as File | null;

    const validCategories = ['tropical', 'citrus', 'berries', 'melons', 'stone', 'other'];
    if (category && !validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    let imagePath: string | undefined;

    if (imageFile && imageFile.size > 0) {
      const ext = imageFile.name.split('.').pop() ?? 'jpg';
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const bytes = await imageFile.arrayBuffer();
      await writeFile(
        path.join(process.cwd(), 'public', 'images', 'uploads', filename),
        Buffer.from(bytes)
      );
      imagePath = `/images/uploads/${filename}`;
    }

    db.update(products)
      .set({
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(category && { category: category as 'tropical' | 'citrus' | 'berries' | 'melons' | 'stone' | 'other' }),
        ...(stock && { stock: parseInt(stock) }),
        ...(unit && { unit }),
        ...(imagePath && { image: imagePath }),
        status: 'pending',
      })
      .where(eq(products.id, productId))
      .run();

    return NextResponse.json({ message: 'Product updated and re-submitted for approval' });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'seller') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const productId = parseInt(id);
  const sellerId = parseInt(session.user.id);

  const product = db.select().from(products).where(eq(products.id, productId)).get();

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  if (product.sellerId !== sellerId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const existingOrderItems = db
    .select()
    .from(orderItems)
    .where(eq(orderItems.productId, productId))
    .all();

  if (existingOrderItems.length > 0) {
    return NextResponse.json(
      { error: 'Cannot delete product with existing orders' },
      { status: 400 }
    );
  }

  db.delete(products).where(eq(products.id, productId)).run();

  return NextResponse.json({ message: 'Product deleted' });
}
