import { NextRequest, NextResponse } from 'next/server';
import { usersDb, initializeData } from '@/lib/data';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export async function GET(req: NextRequest) {
  initializeData();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;

  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';

  let users = Array.from(usersDb.values()).map(({ password: _p, ...u }) => u);

  if (search) {
    users = users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
  }

  return NextResponse.json({ users });
}
