import { NextRequest, NextResponse } from 'next/server';
import { productsDb, initializeData } from '@/lib/data';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  initializeData();
  const { id } = await params;
  const product = productsDb.get(id);

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  initializeData();
  const { id } = await params;

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;

  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const product = productsDb.get(id);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const updated = {
      ...product,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    productsDb.set(id, updated);
    return NextResponse.json({ product: updated });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  initializeData();
  const { id } = await params;

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;

  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const product = productsDb.get(id);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  productsDb.delete(id);
  return NextResponse.json({ success: true });
}
