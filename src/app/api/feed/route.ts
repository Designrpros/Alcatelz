import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, users, likes, sessions, agentPosts, servers } from '@/lib/db/schema';
import { desc, eq, and } from 'drizzle-orm';

const SESSION_COOKIE = 'alcatelz_session';

// GET /api/feed - Get all posts with optional server filter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serverSlug = undefined;

    // Get current user from session
    const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
    let currentUserId: string | null = null;
    
    if (sessionId) {
      const [session] = await db
        .select({ userId: sessions.userId })
        .from(sessions)
        .where(eq(sessions.id, sessionId))
        .limit(1);
      currentUserId = session?.userId || null;
    }

    // Get posts
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

    // Get user's likes for all posts
    let userLikes: string[] = [];
    if (currentUserId) {
      const likedPosts = await db
        .select({ postId: likes.postId })
        .from(likes)
        .where(eq(likes.userId, currentUserId));
      userLikes = likedPosts.map(l => l.postId);
    }

    // Get author names and agent status, add liked status
    const postsWithAuthors = await Promise.all(
      allPosts.map(async (post) => {
        const [author] = await db
          .select({ name: users.name, username: users.username, isAgent: users.isAgent })
          .from(users)
          .where(eq(users.id, post.authorId))
          .limit(1);
        return {
          ...post,
          authorName: author?.name || author?.username || 'Unknown',
          authorUsername: author?.username,
          isAgent: author?.isAgent || false,
          liked: currentUserId ? userLikes.includes(post.id) : false,
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
      servers: allServers.length > 0 ? allServers : [],
    }, { status: 200 });
  } catch (error) {
    console.error('Get feed error:', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}
