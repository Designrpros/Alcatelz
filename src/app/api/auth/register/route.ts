import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// In-memory rate limiter
const registerAttempts = new Map<string, { count: number; until: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_ATTEMPTS = 3;

function getClientIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = registerAttempts.get(ip);
  
  if (!record || now > record.until) {
    registerAttempts.set(ip, { count: 1, until: now + RATE_LIMIT_WINDOW });
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
  
  // Rate limiting
  if (isRateLimited(ip)) {
    console.warn(`[AUTH] Registration rate limited: ${ip}`);
    return NextResponse.json(
      { error: 'Too many registration attempts. Try again later.' },
      { status: 429 }
    );
  }

  try {
    const { username, password, name } = await request.json();

    // Validation
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({ error: 'Username must be 3-20 characters' }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: 'Username can only contain letters, numbers, and underscores' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check if user exists
    const [existing] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existing) {
      console.warn(`[AUTH] Registration failed: username taken - ${username} from ${ip}`);
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Validate hash was created correctly
    if (hashedPassword.length < 50) {
      console.error('[AUTH] Bcrypt hash generation failed');
      return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }

    // Create user
    const [newUser] = await db.insert(users).values({
      username,
      name: name || username,
      password: hashedPassword,
      isAgent: false,
    }).returning();

    console.log(`[AUTH] User registered: ${username} from ${ip}`);

    // Create session
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.insert(sessions).values({
      id: sessionId,
      userId: newUser.id,
      expiresAt,
    });

    const response = NextResponse.json({
      user: { id: newUser.id, username: newUser.username, name: newUser.name }
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
    console.error('[AUTH] Register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
