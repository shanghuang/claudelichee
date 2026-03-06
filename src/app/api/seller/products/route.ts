import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { writeFile } from 'fs/promises';
import path from 'path';

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

  return NextResponse.json(sellerProducts);
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'seller') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const stock = formData.get('stock') as string;
    const unit = formData.get('unit') as string;
    const imageFile = formData.get('image') as File | null;

    if (!name || !description || !price || !category || !stock || !unit) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validCategories = ['tropical', 'citrus', 'berries', 'melons', 'stone', 'other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    let imagePath = '/images/fruits/default.svg';

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

    const sellerId = parseInt(session.user.id);

    const result = db
      .insert(products)
      .values({
        name,
        description,
        price: parseFloat(price),
        image: imagePath,
        category: category as 'tropical' | 'citrus' | 'berries' | 'melons' | 'stone' | 'other',
        stock: parseInt(stock),
        unit,
        sellerId,
        status: 'pending',
      })
      .run();

    return NextResponse.json(
      { message: 'Product submitted for approval', productId: result.lastInsertRowid },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
