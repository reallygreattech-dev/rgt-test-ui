import { NextRequest, NextResponse } from 'next/server';
import { usersDb, initializeData } from '@/lib/data';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

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

  // Users can only get their own info, admins can get anyone
  if (user.role !== 'admin' && user.sub !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const found = usersDb.get(id);
  if (!found) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { password: _p, ...safeUser } = found;
  return NextResponse.json({ user: safeUser });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  initializeData();
  const { id } = await params;

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const authUser = token ? verifyToken(token) : null;

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only admins can change roles; users can update their own profile
  const targetUser = usersDb.get(id);
  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (authUser.role !== 'admin' && authUser.sub !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();

    // Non-admins cannot change role or status
    if (authUser.role !== 'admin') {
      delete body.role;
      delete body.status;
    }

    const updated = {
      ...targetUser,
      ...body,
      id,
      password: targetUser.password, // Don't allow password update via this route
    };

    usersDb.set(id, updated);
    const { password: _p, ...safeUser } = updated;
    return NextResponse.json({ user: safeUser });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
