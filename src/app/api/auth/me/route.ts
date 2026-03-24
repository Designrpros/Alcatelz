import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, sessions } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'alcatelz_session';

export interface AuthUser {
  id: string;
  username: string;
  name: string | null;
}

// GET /api/auth/me - Get current user
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

    if (!sessionId) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Find valid session
    const [session] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.id, sessionId),
          gt(sessions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Get user
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        version: users.version,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    // CRITICAL: Check version match - invalidates sessions when user is recreated
    if (!user || user.version !== session.userVersion) {
      // Delete the old session
      await db.delete(sessions).where(eq(sessions.id, sessionId));
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user: {
      id: user.id,
      username: user.username,
      name: user.name,
    }});
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
  }
}
