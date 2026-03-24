/* eslint-disable */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    
    const cookieHeader = request.headers.get('cookie');
    const sessionId = cookieHeader?.match(/alcatelz_session=([^;]+)/)?.[1];

    if (!sessionId) {
      return NextResponse.json({ error: 'Must be logged in' }, { status: 401 });
    }

    const [sessionData]: any = await db
      .select({ userId: sessions.userId })
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1)
      .execute();

    if (!sessionData) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const [post]: any = await db
      .select({ likesCount: posts.likesCount })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1)
      .execute();

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await db
      .update(posts)
      .set({ likesCount: (post.likesCount || 0) + 1 })
      .where(eq(posts.id, postId))
      .execute();

    return NextResponse.json({ success: true, likesCount: (post.likesCount || 0) + 1 });
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ error: 'Failed to like post' }, { status: 500 });
  }
}
