import { NextRequest, NextResponse } from 'next/server';
import { usersDb, initializeData } from '@/lib/data';
import { signToken, COOKIE_NAME } from '@/lib/auth';
import { User } from '@/lib/types';

export async function POST(req: NextRequest) {
  initializeData();

  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const existing = Array.from(usersDb.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      role: 'user',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    usersDb.set(newUser.id, newUser);

    const token = signToken({
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    const response = NextResponse.json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    }, { status: 201 });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
