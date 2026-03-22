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

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

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
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    return user || null;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE };
