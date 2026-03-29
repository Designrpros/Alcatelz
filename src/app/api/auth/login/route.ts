import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Simple in-memory rate limiter (resets on server restart)
const loginAttempts = new Map<string, { count: number; until: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 min
const MAX_ATTEMPTS = 5;

function getClientIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  
  if (!record || now > record.until) {
    loginAttempts.set(ip, { count: 1, until: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (record.count >= MAX_ATTEMPTS) {
    return true;
  }
  
  record.count++;
  return false;
}

export async function POST(request: Request) {
  const ip = getClientIP(request);
  
  // Rate limiting check
  if (isRateLimited(ip)) {
    console.warn(`[AUTH] Rate limited IP: ${ip}`);
    return NextResponse.json(
      { error: 'Too many login attempts. Try again in 15 minutes.' },
      { status: 429 }
    );
  }

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
      console.warn(`[AUTH] Login failed: user not found - ${username} from ${ip}`);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Validate password hash format (bcrypt should be ~60 chars)
    if (typeof user.password !== 'string' || user.password.length < 50) {
      console.error(`[AUTH] Corrupt password hash for user ${username}: length ${user.password?.length || 0}`);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check password (hashed with bcrypt)
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.warn(`[AUTH] Login failed: wrong password - ${username} from ${ip}`);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Login successful - clear rate limit
    loginAttempts.delete(ip);
    console.log(`[AUTH] Login success: ${username} from ${ip}`);

    // Invalidate all existing sessions for this user (single session per user)
    await db
      .delete(sessions)
      .where(eq(sessions.userId, user.id));

    // Create new session
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const userAgent = request.headers.get('user-agent') || 'unknown';

    await db
      .insert(sessions)
      .values({
        id: sessionId,
        userId: user.id,
        userVersion: user.version || 1,
        ipAddress: ip,
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

    response.cookies.set('alcatelz_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
