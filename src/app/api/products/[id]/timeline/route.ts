import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { productTimeline, products } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const entries = db
    .select()
    .from(productTimeline)
    .where(eq(productTimeline.productId, parseInt(id)))
    .orderBy(desc(productTimeline.createdAt))
    .all();

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const productId = parseInt(id);

  const product = db.select().from(products).where(eq(products.id, productId)).get();
  if (!product || product.sellerId !== parseInt(session.user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const formData = await req.formData();
  const content = (formData.get('content') as string)?.trim();
  const imageFile = formData.get('image') as File | null;

  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  let imagePath: string | null = null;
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

  const entry = db
    .insert(productTimeline)
    .values({ productId, sellerId: parseInt(session.user.id), content, image: imagePath })
    .returning()
    .get();

  return NextResponse.json(entry, { status: 201 });
}
