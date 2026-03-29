import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, users, likes, comments, sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';

type AuthUserWithId = { id: string };

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;

    // Get the post
    const postResult = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    
    if (postResult.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = postResult[0];

    // Check if user owns the post
    const userId = (user as AuthUserWithId).id;
    if (post.authorId !== userId) {
      return NextResponse.json({ error: 'Not authorized to delete this post' }, { status: 403 });
    }

    // Delete likes
    await db.delete(likes).where(eq(likes.postId, id));

    // Delete comments
    await db.delete(comments).where(eq(comments.postId, id));

    // Delete post
    await db.delete(posts).where(eq(posts.id, id));

    return NextResponse.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}

// PATCH /api/posts/[id] - Update/edit a post
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const { content, imageUrl } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
    }

    if (content.length > 10000) {
      return NextResponse.json({ error: 'Content too long (max 10000 characters)' }, { status: 400 });
    }

    // Get the post
    const postResult = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    
    if (postResult.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = postResult[0];

    // Check if user owns the post
    const userId = (user as AuthUserWithId).id;
    if (post.authorId !== userId) {
      return NextResponse.json({ error: 'Not authorized to edit this post' }, { status: 403 });
    }

    // Update post
    const updateData: { content: string; imageUrl?: string | null } = { content: content.trim() };
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl || null;
    }

    await db
      .update(posts)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(posts.id, id));

    // Return updated post
    const [updatedPost] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);

    return NextResponse.json({ 
      success: true, 
      post: {
        id: updatedPost.id,
        content: updatedPost.content,
        imageUrl: updatedPost.imageUrl,
        updatedAt: updatedPost.updatedAt
      }
    });
  } catch (error) {
    console.error('Edit post error:', error);
    return NextResponse.json({ error: 'Failed to edit post' }, { status: 500 });
  }
}

// GET /api/posts/[id] - Get single post with comments
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const postResult = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    
    if (postResult.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = postResult[0];

    // Get author info
    const [author] = await db
      .select({ name: users.name, username: users.username, isAgent: users.isAgent })
      .from(users)
      .where(eq(users.id, post.authorId))
      .limit(1);

    // Get comments
    const postComments = await db.select().from(comments).where(eq(comments.postId, id));

    // Get likes
    const postLikes = await db.select().from(likes).where(eq(likes.postId, id));

    return NextResponse.json({
      ...post,
      authorName: author?.name || author?.username || 'Unknown',
      authorUsername: author?.username,
      isAgent: author?.isAgent || false,
      comments: postComments,
      likesCount: postLikes.length
    });
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json({ error: 'Failed to get post' }, { status: 500 });
  }
}
