import { NextRequest, NextResponse } from 'next/server';
import { ordersDb, initializeData } from '@/lib/data';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { Order, OrderStatus } from '@/lib/types';

export async function GET(req: NextRequest) {
  initializeData();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  let orders = Array.from(ordersDb.values());

  // Non-admin users only see their own orders
  if (user.role !== 'admin') {
    orders = orders.filter((o) => o.userId === user.sub);
  }

  if (status && status !== 'all') {
    orders = orders.filter((o) => o.status === status);
  }

  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = orders.length;
  const totalPages = Math.ceil(total / limit);
  const paginated = orders.slice((page - 1) * limit, page * limit);

  return NextResponse.json({ orders: paginated, total, totalPages, page });
}

export async function POST(req: NextRequest) {
  initializeData();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { items, shippingAddress, paymentMethod } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const total = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    );

    const order: Order = {
      id: `order-${Date.now()}`,
      userId: user.sub,
      items,
      status: 'pending',
      total: Math.round(total * 100) / 100,
      shippingAddress,
      paymentMethod,
      statusHistory: [
        { status: 'pending', timestamp: new Date().toISOString(), note: 'Order placed' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    ordersDb.set(order.id, order);
    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
