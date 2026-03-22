import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/posts - Get all posts
export async function GET() {
  try {
    const allPosts = await db
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
      .orderBy(posts.createdAt)
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

    return NextResponse.json({ posts: postsWithAuthors.reverse() }, { status: 200 });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST /api/posts - Create a new post
export async function POST(request: Request) {
  try {
    const { authorId, content, imageUrl } = await request.json();

    if (!authorId || !content) {
      return NextResponse.json({ error: 'Missing required fields: authorId and content' }, { status: 400 });
    }

    const [newPost] = await db
      .insert(posts)
      .values({
        authorId,
        content,
        imageUrl: imageUrl || null,
      })
      .returning();

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
