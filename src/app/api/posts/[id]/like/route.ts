import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, likes, sessions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    
    // Get user from session
    const cookieHeader = request.headers.get('cookie');
    const sessionId = cookieHeader?.match(/alcatelz_session=([^;]+)/)?.[1];

    if (!sessionId) {
      return NextResponse.json({ error: 'Must be logged in' }, { status: 401 });
    }

    const [sessionData] = await db
      .select({ userId: sessions.userId })
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!sessionData) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const userId = sessionData.userId;

    // Check if user already liked the post
    const existingLike = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)))
      .limit(1);

    let liked: boolean;
    let likesCount: number;

    if (existingLike.length > 0) {
      // Unlike - remove the like
      await db.delete(likes).where(eq(likes.id, existingLike[0].id));
      liked = false;
    } else {
      // Like - add new like
      await db.insert(likes).values({ userId, postId });
      liked = true;
    }

    // Get updated likes count
    const likesResult = await db
      .select()
      .from(likes)
      .where(eq(likes.postId, postId));

    likesCount = likesResult.length;

    // Update post likesCount
    await db
      .update(posts)
      .set({ likesCount })
      .where(eq(posts.id, postId));

    return NextResponse.json({ success: true, liked, likesCount });
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ error: 'Failed to like post' }, { status: 500 });
  }
}
