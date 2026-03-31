import { NextRequest, NextResponse } from 'next/server';
import { cartsDb, initializeData } from '@/lib/data';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { CartItem } from '@/lib/types';

export async function GET(req: NextRequest) {
  initializeData();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cart = cartsDb.get(user.sub) || { userId: user.sub, items: [] };
  return NextResponse.json({ cart });
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
    const item: CartItem = body.item;

    const cart = cartsDb.get(user.sub) || { userId: user.sub, items: [] };
    const existingIdx = cart.items.findIndex((i) => i.productId === item.productId);

    if (existingIdx >= 0) {
      cart.items[existingIdx].quantity += item.quantity;
    } else {
      cart.items.push(item);
    }

    cartsDb.set(user.sub, cart);
    return NextResponse.json({ cart });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  initializeData();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  cartsDb.set(user.sub, { userId: user.sub, items: [] });
  return NextResponse.json({ success: true });
}
