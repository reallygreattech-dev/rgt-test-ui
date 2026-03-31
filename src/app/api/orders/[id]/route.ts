import { NextRequest, NextResponse } from 'next/server';
import { ordersDb, initializeData } from '@/lib/data';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { OrderStatus } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  initializeData();
  const { id } = await params;

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const order = ordersDb.get(id);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (user.role !== 'admin' && order.userId !== user.sub) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ order });
}

export async function PATCH(
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

  const order = ordersDb.get(id);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { status, note } = body;

    const updated = {
      ...order,
      status: status as OrderStatus,
      statusHistory: [
        ...order.statusHistory,
        {
          status: status as OrderStatus,
          timestamp: new Date().toISOString(),
          note: note || `Status updated to ${status}`,
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    ordersDb.set(id, updated);
    return NextResponse.json({ order: updated });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
