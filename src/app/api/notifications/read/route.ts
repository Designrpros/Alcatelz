import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/notifications/read - Mark notification(s) as read
export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const sessionId = cookieHeader?.match(/alcatelz_session=([^;]+)/)?.[1];

    if (!sessionId) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    const { notificationId, all } = await request.json();

    if (all) {
      // Mark all as read for this user
      await db
        .update(notifications)
        .set({ read: true })
        .where(eq(notifications.read, false));
    } else if (notificationId) {
      // Mark single as read
      await db
        .update(notifications)
        .set({ read: true })
        .where(eq(notifications.id, notificationId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }
}
