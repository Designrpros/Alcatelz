import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifications, users, sessions } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

const SESSION_COOKIE = 'alcatelz_session';

function getUserIdFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match ? match[1] : null;
}

// GET /api/notifications - Get notifications for user
export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const sessionId = getUserIdFromCookies(cookieHeader);
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    // Find user by session
    const [sessionData] = await db
      .select({ userId: sessions.userId })
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!sessionData) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const userId = sessionData.userId;

    // Check if admin (alcatelz)
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const isAdmin = user?.username === 'alcatelz';

    let results;

    if (isAdmin) {
      // Admin sees all
      results = await db
        .select()
        .from(notifications)
        .orderBy(desc(notifications.createdAt))
        .limit(100);
    } else {
      // Regular users see only theirs
      results = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(50);
    }

    return NextResponse.json({ 
      notifications: results,
      unreadCount: results.filter((n: { read: boolean }) => !n.read).length 
    });
  } catch (error) {
    console.error('Notifications error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST /api/notifications - Create notification (internal use)
export async function POST(request: Request) {
  try {
    const { userId, type, message, link } = await request.json();

    if (!userId || !type || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [notification] = await db
      .insert(notifications)
      .values({
        userId,
        type,
        message,
        link: link || null,
        read: false,
      })
      .returning();

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
