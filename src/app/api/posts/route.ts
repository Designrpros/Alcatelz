import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';

// GET /api/posts - Get all posts (optional filter by server)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serverSlug = searchParams.get('server') || 'alcatelz';

    const allPosts = await db
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
      .where(eq(posts.serverSlug, serverSlug))
      .orderBy(desc(posts.createdAt))
      .limit(50);

    // Get author names
    const postsWithAuthors = await Promise.all(
      allPosts.map(async (post) => {
        const [author] = await db
          .select({ name: users.name, username: users.username })
          .from(users)
          .where(eq(users.id, post.authorId))
          .limit(1);
        return {
          ...post,
          authorName: author?.name || author?.username || 'Unknown',
        };
      })
    );

    return NextResponse.json({ posts: postsWithAuthors }, { status: 200 });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST /api/posts - Create a new post (requires auth)
export async function POST(request: Request) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to post' }, { status: 401 });
    }

    const { content, imageUrl, serverSlug } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: 'Content too long (max 5000 characters)' }, { status: 400 });
    }

    const targetServer = serverSlug || 'alcatelz';

    const [newPost] = await db
      .insert(posts)
      .values({
        authorId: user.id,
        content: content.trim(),
        imageUrl: imageUrl || null,
        serverSlug: targetServer,
      })
      .returning();

    return NextResponse.json({
      ...newPost,
      authorName: user.name || user.username,
    }, { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
