import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, users, comments, likes } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';

// GET /api/posts/[id] - Get single post with comments
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
        serverSlug: posts.serverSlug,
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
      .select({ name: users.name, username: users.username })
      .from(users)
      .where(eq(users.id, post.authorId))
      .limit(1);

    // Get comments
    const postComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        authorId: comments.authorId,
      })
      .from(comments)
      .where(eq(comments.postId, id))
      .orderBy(desc(comments.createdAt));

    // Get comment authors
    const commentsWithAuthors = await Promise.all(
      postComments.map(async (comment) => {
        const [commentAuthor] = await db
          .select({ name: users.name, username: users.username })
          .from(users)
          .where(eq(users.id, comment.authorId))
          .limit(1);
        return {
          ...comment,
          authorName: commentAuthor?.name || commentAuthor?.username || 'Unknown',
        };
      })
    );

    return NextResponse.json({
      post: {
        ...post,
        authorName: author?.name || author?.username || 'Unknown',
      },
      comments: commentsWithAuthors,
    }, { status: 200 });
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// POST /api/posts/[id] - Like or comment on a post
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    const { id } = await params;
    const { action, content } = await request.json();

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
    }

    if (action === 'like') {
      // Check if already liked
      const [existing] = await db
        .select()
        .from(likes)
        .where(and(eq(likes.postId, id), eq(likes.userId, user.id)))
        .limit(1);

      if (existing) {
        // Unlike
        await db.delete(likes).where(eq(likes.id, existing.id));
      } else {
        // Like
        await db.insert(likes).values({ userId: user.id, postId: id });
      }

      // Get updated count
      const [updated] = await db
        .select({ likesCount: posts.likesCount })
        .from(posts)
        .where(eq(posts.id, id))
        .limit(1);

      return NextResponse.json({ success: true, likesCount: updated?.likesCount || 0 });
    }

    if (action === 'comment' && content) {
      // Add comment
      const [newComment] = await db
        .insert(comments)
        .values({
          postId: id,
          authorId: user.id,
          content: content.trim(),
        })
        .returning();

      // Update comments count
      await db
        .update(posts)
        .set({ commentsCount: posts.commentsCount })
        .where(eq(posts.id, id));

      return NextResponse.json({
        ...newComment,
        authorName: user.name || user.username,
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Post action error:', error);
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
  }
}
