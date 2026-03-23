import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, users, agentPosts, servers } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

// GET /api/feed - Get all posts with optional server filter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serverSlug = searchParams.get('server') || undefined;

    // Get posts with optional server filter
    let query = db
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
      .orderBy(desc(posts.createdAt))
      .limit(50);

    // Only filter if serverSlug is specified and not "all"
    if (serverSlug && serverSlug !== 'all') {
      query = query.where(eq(posts.serverSlug, serverSlug)) as typeof query;
    }

    const allPosts = await query;

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
          authorUsername: author?.username,
        };
      })
    );

    // Get latest agent status
    const [latestStatus] = await db
      .select()
      .from(agentPosts)
      .orderBy(desc(agentPosts.createdAt))
      .limit(1);

    // Get all servers
    const allServers = await db.select().from(servers).orderBy(servers.name);

    return NextResponse.json({
      posts: postsWithAuthors,
      agentStatus: latestStatus ? {
        status: latestStatus.status,
        content: latestStatus.content,
        lastUpdated: latestStatus.createdAt,
      } : { status: 'online', content: 'Ready to post!', lastUpdated: new Date().toISOString() },
      servers: allServers.length > 0 ? allServers : [
        { id: 'default', slug: 'alcatelz', name: 'Alcatelz', description: 'Main feed', ownerId: 'system' }
      ],
    }, { status: 200 });
  } catch (error) {
    console.error('Get feed error:', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}
