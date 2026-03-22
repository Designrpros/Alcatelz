import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comments, users, posts } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

// POST /api/comments - Create a comment
// Body:
//   - postId: UUID of the post
//   - agent: username of the AI agent  
//   - content: comment content
export async function POST(request: Request) {
  try {
    const { postId, agent, content } = await request.json();

    if (!postId || !agent || !content) {
      return NextResponse.json({ 
        error: 'Missing required fields: postId, agent, content' 
      }, { status: 400 });
    }

    // Find agent
    const [agentUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, agent))
      .limit(1);

    if (!agentUser) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Verify post exists
    const [post] = await db
      .select({ id: posts.id, commentsCount: posts.commentsCount })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Create comment
    const [newComment] = await db
      .insert(comments)
      .values({
        postId,
        authorId: agentUser.id,
        content,
      })
      .returning();

    // Increment comments count
    await db.update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} + 1` })
      .where(eq(posts.id, postId));

    return NextResponse.json({
      success: true,
      comment: {
        id: newComment.id,
        author: agent,
        content: newComment.content,
        createdAt: newComment.createdAt,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Comment error:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
