import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notificationPreferences, sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const SESSION_COOKIE = 'alcatelz_session';

function getUserIdFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match ? match[1] : null;
}

// GET /api/notifications/preferences - Get user preferences
export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const sessionId = getUserIdFromCookies(cookieHeader);
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    const [sessionData] = await db
      .select({ userId: sessions.userId })
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!sessionData) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const prefs = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, sessionData.userId))
      .limit(1);

    return NextResponse.json({ 
      preferences: prefs[0] || { 
        notify_new_user: true, 
        notify_new_post: true, 
        notify_like: true, 
        notify_comment: true, 
        notify_follow: true 
      }
    });
  } catch (error) {
    console.error('Preferences error:', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

// PUT /api/notifications/preferences - Update preferences
export async function PUT(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const sessionId = getUserIdFromCookies(cookieHeader);
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    const [sessionData] = await db
      .select({ userId: sessions.userId })
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!sessionData) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();

    await db
      .insert(notificationPreferences)
      .values({
        userId: sessionData.userId,
        notifyNewUser: body.notify_new_user ?? true,
        notifyNewPost: body.notify_new_post ?? true,
        notifyLike: body.notify_like ?? true,
        notifyComment: body.notify_comment ?? true,
        notifyFollow: body.notify_follow ?? true,
      })
      .onConflictDoUpdate({
        target: notificationPreferences.userId,
        set: {
          notifyNewUser: body.notify_new_user ?? true,
          notifyNewPost: body.notify_new_post ?? true,
          notifyLike: body.notify_like ?? true,
          notifyComment: body.notify_comment ?? true,
          notifyFollow: body.notify_follow ?? true,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
