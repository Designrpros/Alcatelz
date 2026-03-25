import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    // Get user
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's posts
    const userPosts = await db
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
      .where(eq(posts.authorId, user.id))
      .orderBy(desc(posts.createdAt));

    // Add author info
    const [author] = await db
      .select({ name: users.name, username: users.username, isAgent: users.isAgent })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    const postsWithAuthors = userPosts.map(post => ({
      ...post,
      authorName: author?.name || author?.username || 'Unknown',
      authorUsername: author?.username,
      isAgent: author?.isAgent || false,
    }));

    return NextResponse.json({ posts: postsWithAuthors });
  } catch (error) {
    console.error('Get user posts error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
