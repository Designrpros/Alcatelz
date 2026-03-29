import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, users, likes, sessions, agentPosts, servers, comments } from '@/lib/db/schema';
import { desc, eq, inArray, sql, and, gte, count } from 'drizzle-orm';

const SESSION_COOKIE = 'alcatelz_session';

// GET /api/feed - Get posts with pagination and filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;
    const type = searchParams.get('type') || 'all'; // all, hot, trending

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

    // Get posts with optional filtering
    let allPosts;
    const isHot = type === 'hot';
    const isTrending = type === 'trending';
    
    if (isTrending) {
      // Trending: posts from last 24h, sorted by engagement
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      allPosts = await db
        .select({
          id: posts.id,
          authorId: posts.authorId,
          content: posts.content,
          imageUrl: posts.imageUrl,
          createdAt: posts.createdAt,
        })
        .from(posts)
        .where(gte(posts.createdAt, oneDayAgo))
        .orderBy(desc(posts.likesCount))
        .limit(100)
        .offset(offset);
    } else {
      // All or hot - get posts sorted by engagement
      allPosts = await db
        .select({
          id: posts.id,
          authorId: posts.authorId,
          content: posts.content,
          imageUrl: posts.imageUrl,
          createdAt: posts.createdAt,
        })
        .from(posts)
        .orderBy(isHot ? desc(posts.likesCount) : desc(posts.createdAt))
        .limit(isHot ? 100 : limit)
        .offset(isHot ? 0 : offset);
    }

    // Get like and comment counts for all posts
    const postIds = allPosts.map(p => p.id);
    
    // Count likes per post
    const likeCounts = postIds.length > 0 ? await db
      .select({
        postId: likes.postId,
        count: count()
      })
      .from(likes)
      .where(inArray(likes.postId, postIds))
      .groupBy(likes.postId) : [];
    
    // Count comments per post
    const commentCounts = postIds.length > 0 ? await db
      .select({
        postId: comments.postId,
        count: count()
      })
      .from(comments)
      .where(inArray(comments.postId, postIds))
      .groupBy(comments.postId) : [];

    const likeMap = new Map(likeCounts.map(l => [l.postId, Number(l.count)]));
    const commentMap = new Map(commentCounts.map(c => [c.postId, Number(c.count)]));

    // Add counts to posts
    let postsWithCounts = allPosts.map(post => ({
      ...post,
      likesCount: likeMap.get(post.id) || 0,
      commentsCount: commentMap.get(post.id) || 0,
    }));

    // Apply hot/trending sort
    if (type === 'hot') {
      // Sort by engagement (likes + comments*2)
      postsWithCounts.sort((a, b) => {
        const scoreA = a.likesCount + a.commentsCount * 2;
        const scoreB = b.likesCount + b.commentsCount * 2;
        return scoreB - scoreA;
      });
      // Apply pagination after sorting
      postsWithCounts = postsWithCounts.slice(offset, offset + limit);
    }

    // Get user's likes for all posts
    let userLikes: string[] = [];
    if (currentUserId && postIds.length > 0) {
      const likedPosts = await db
        .select({ postId: likes.postId })
        .from(likes)
        .where(eq(likes.userId, currentUserId));
      userLikes = likedPosts.map(l => l.postId).filter(id => postIds.includes(id));
    }

    // Get author names and agent status, add liked status
    const postsWithAuthors = await Promise.all(
      postsWithCounts.map(async (post) => {
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

    const hasMore = isHot ? false : (allPosts.length === limit);

    return NextResponse.json({
      posts: postsWithAuthors,
      hasMore,
      page,
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
