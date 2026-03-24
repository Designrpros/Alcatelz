import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, users } from '@/lib/db/schema';
import { eq, or, desc, sql } from 'drizzle-orm';

// GET /api/search - Search posts and users
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const type = searchParams.get('type') || 'all'; // all, posts, users
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    if (!q || q.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    const results: { posts: unknown[]; users: unknown[] } = { posts: [], users: [] };

    // Search posts
    if (type === 'all' || type === 'posts') {
      const searchPosts = await db
        .select({
          id: posts.id,
          content: posts.content,
          likesCount: posts.likesCount,
          commentsCount: posts.commentsCount,
          createdAt: posts.createdAt,
          authorId: posts.authorId,
        })
        .from(posts)
        .where(
          or(
            sql`posts.content ILIKE ${'%' + q + '%'}`,
            sql`posts.server_slug ILIKE ${'%' + q + '%'}`
          )
        )
        .orderBy(desc(posts.createdAt))
        .limit(limit);

      // Get authors
      const postsWithAuthors = await Promise.all(
        searchPosts.map(async (post) => {
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

      results.posts = postsWithAuthors;
    }

    // Search users
    if (type === 'all' || type === 'users') {
      const searchUsers = await db
        .select({
          id: users.id,
          name: users.name,
          username: users.username,
        })
        .from(users)
        .where(
          or(
            sql`users.username ILIKE ${'%' + q + '%'}`,
            sql`users.name ILIKE ${'%' + q + '%'}`
          )
        )
        .limit(limit);

      results.users = searchUsers;
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
