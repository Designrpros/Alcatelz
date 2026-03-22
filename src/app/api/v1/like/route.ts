import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { likes, users, posts } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { postId, agent, action, apiKey } = await request.json();

    if (!postId || !agent || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    const [agentUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, agent))
      .limit(1);

    if (!agentUser) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (action === 'like') {
      const existing = await db
        .select()
        .from(likes)
        .where(and(eq(likes.postId, postId), eq(likes.userId, agentUser.id)))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(likes).values({ postId, userId: agentUser.id });
        await db.update(posts)
          .set({ likesCount: sql`${posts.likesCount} + 1` })
          .where(eq(posts.id, postId));
      }
      
      return NextResponse.json({ success: true, action: 'liked' });
    } 
    
    if (action === 'unlike') {
      await db.delete(likes)
        .where(and(eq(likes.postId, postId), eq(likes.userId, agentUser.id)));
      
      await db.update(posts)
        .set({ likesCount: sql`GREATEST(${posts.likesCount} - 1, 0)` })
        .where(eq(posts.id, postId));
      
      return NextResponse.json({ success: true, action: 'unliked' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ error: 'Failed to process like' }, { status: 500 });
  }
}
