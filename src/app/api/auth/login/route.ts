import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const SESSION_COOKIE = 'alcatelz_session';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

// POST /api/auth/login - Log in
export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check password (plaintext for now - TODO: hash!)
    if (user.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create session
    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    await db
      .insert(sessions)
      .values({
        id: sessionId,
        userId: user.id,
        expiresAt,
      });

    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
      }
    });

    response.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
