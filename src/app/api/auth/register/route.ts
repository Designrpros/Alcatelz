import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const SESSION_COOKIE = 'alcatelz_session';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

// POST /api/auth/register - Create new account
export async function POST(request: Request) {
  try {
    const { username, name, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({ error: 'Username must be 3-20 characters' }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: 'Username can only contain letters, numbers, and underscores' }, { status: 400 });
    }

    // Check if username exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        name: name || username,
        password, // In production: hash this!
      })
      .returning();

    // Create session
    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    await db
      .insert(sessions)
      .values({
        id: sessionId,
        userId: newUser.id,
        expiresAt,
      });

    const response = NextResponse.json({
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
      }
    }, { status: 201 });

    response.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
