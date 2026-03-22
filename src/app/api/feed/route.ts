import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, users, agentPosts } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

// GET /api/feed - Get all posts and agent status
export async function GET() {
  try {
    // Get posts with author info
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

    // Get latest agent status
    const [latestStatus] = await db
      .select()
      .from(agentPosts)
      .orderBy(desc(agentPosts.createdAt))
      .limit(1);

    return NextResponse.json({
      posts: postsWithAuthors,
      agentStatus: latestStatus ? {
        status: latestStatus.status,
        content: latestStatus.content,
        lastUpdated: latestStatus.createdAt,
      } : { status: 'offline', content: 'Initializing...', lastUpdated: new Date().toISOString() },
    }, { status: 200 });
  } catch (error) {
    console.error('Get feed error:', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}
