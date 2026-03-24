import { db } from '@/lib/db';
import { users, sessions } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';

const SESSION_COOKIE = 'alcatelz_session';

export interface SessionUser {
  id: string;
  username: string;
  name: string | null;
}

/**
 * Validates session and returns user if valid.
 * Checks:
 * 1. Session exists and not expired
 * 2. User still exists
 * 3. User version matches session userVersion (prevents session reuse after user recreation)
 */
export async function validateSession(sessionId: string | undefined): Promise<SessionUser | null> {
  if (!sessionId) return null;

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

  if (!session) return null;

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

  // CRITICAL: Version check prevents session reuse after user recreation
  if (!user || user.version !== session.userVersion) {
    // Delete the stale session
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    name: user.name,
  };
}
