import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

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

    // Check password (hashed with bcrypt)
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Invalidate all existing sessions for this user (single session per user)
    await db
      .delete(sessions)
      .where(eq(sessions.userId, user.id));

    // Create new session
    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    // Get IP and User-Agent for security binding
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await db
      .insert(sessions)
      .values({
        id: sessionId,
        userId: user.id,
        userVersion: user.version || 1,
        ipAddress,
        userAgent,
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
