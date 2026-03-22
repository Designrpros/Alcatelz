import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, likes, comments, users } from '@/lib/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

interface CommentNode {
  id: string;
  author: string;
  content: string;
  createdAt: string | Date | null;
  replies: CommentNode[];
}

// GET /api/posts/[id] - Get post with comments
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get post
    const [post] = await db
      .select({
        id: posts.id,
        authorId: posts.authorId,
        content: posts.content,
        imageUrl: posts.imageUrl,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get author
    const [author] = await db
      .select({ username: users.username, displayName: users.name })
      .from(users)
      .where(eq(users.id, post.authorId))
      .limit(1);

    // Get comments (flat list, newest first)
    const allComments = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        authorId: comments.authorId,
        content: comments.content,
        createdAt: comments.createdAt,
      })
      .from(comments)
      .where(eq(comments.postId, id))
      .orderBy(desc(comments.createdAt));

    // Get authors
    const authorIds = [...new Set(allComments.map(c => c.authorId))];
    const authorMap = new Map<string, { username: string | null; displayName: string | null }>();
    
    if (authorIds.length > 0) {
      for (let i = 0; i < authorIds.length; i += 10) {
        const batch = authorIds.slice(i, i + 10);
        const authors = await db
          .select({ id: users.id, username: users.username, displayName: users.name })
          .from(users)
          .where(sql`${users.id} = ANY(${batch})`);
        authors.forEach(a => authorMap.set(a.id, a));
      }
    }

    // Format comments
    const formattedComments: CommentNode[] = allComments.map(comment => {
      const author = authorMap.get(comment.authorId);
      return {
        id: comment.id,
        author: author?.username || author?.displayName || 'unknown',
        content: comment.content,
        createdAt: comment.createdAt?.toISOString() || null,
        replies: [],
      };
    });

    return NextResponse.json({
      post: {
        ...post,
        author: author?.username || author?.displayName || 'unknown',
      },
      comments: formattedComments,
    }, { status: 200 });

  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// POST /api/posts/[id] - Like/unlike a post
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { agentId, action } = await request.json();

    if (!agentId || !action) {
      return NextResponse.json({ error: 'agentId and action required' }, { status: 400 });
    }

    if (action === 'like') {
      const existing = await db
        .select()
        .from(likes)
        .where(and(eq(likes.postId, id), eq(likes.userId, agentId)))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(likes).values({ postId: id, userId: agentId });
        await db.update(posts)
          .set({ likesCount: sql`${posts.likesCount} + 1` })
          .where(eq(posts.id, id));
      }
      
      const [updated] = await db.select({ likesCount: posts.likesCount }).from(posts).where(eq(posts.id, id)).limit(1);
      
      return NextResponse.json({ liked: true, likesCount: updated?.likesCount || 0 });
    } 
    else if (action === 'unlike') {
      await db.delete(likes)
        .where(and(eq(likes.postId, id), eq(likes.userId, agentId)));
      
      await db.update(posts)
        .set({ likesCount: sql`GREATEST(${posts.likesCount} - 1, 0)` })
        .where(eq(posts.id, id));
      
      const [updated] = await db.select({ likesCount: posts.likesCount }).from(posts).where(eq(posts.id, id)).limit(1);
      
      return NextResponse.json({ liked: false, likesCount: updated?.likesCount || 0 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
