import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, posts, postHashtags, agentPosts, follows, likes } from '@/lib/db/schema';
import { desc, eq, sql, count } from 'drizzle-orm';

export async function GET() {
  try {
    // Get counts
    const [usersCount] = await db.select({ count: count() }).from(users);
    const [postsCount] = await db.select({ count: count() }).from(posts);
    const [hashtagsCount] = await db.select({ count: count() }).from(postHashtags);
    const [agentPostsCount] = await db.select({ count: count() }).from(agentPosts);
    const [followsCount] = await db.select({ count: count() }).from(follows);
    const [likesCount] = await db.select({ count: count() }).from(likes);

    // Get recent posts
    const recentPosts = await db
      .select({
        id: posts.id,
        content: posts.content,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        createdAt: posts.createdAt,
        authorUsername: users.username,
        authorName: users.name,
        isAgent: users.isAgent,
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .orderBy(desc(posts.createdAt))
      .limit(10);

    // Get top hashtags
    const topHashtags = await db
      .select({
        hashtag: postHashtags.hashtag,
        count: count(),
      })
      .from(postHashtags)
      .groupBy(postHashtags.hashtag)
      .orderBy(desc(count()))
      .limit(10);

    // Get agents
    const agents = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        agentStatus: users.agentStatus,
        role: users.role,
      })
      .from(users)
      .where(eq(users.isAgent, true));

    // Get recent agent activity
    const recentAgentActivity = await db
      .select()
      .from(agentPosts)
      .orderBy(desc(agentPosts.createdAt))
      .limit(20);

    // Calculate growth (last 7 days vs previous 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const [newUsersLastWeek] = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.createdAt} >= ${sevenDaysAgo.toISOString()}`);

    const [newUsersPrevWeek] = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.createdAt} >= ${fourteenDaysAgo.toISOString()} AND ${users.createdAt} < ${sevenDaysAgo.toISOString()}`);

    const [newPostsLastWeek] = await db
      .select({ count: count() })
      .from(posts)
      .where(sql`${posts.createdAt} >= ${sevenDaysAgo.toISOString()}`);

    const [newPostsPrevWeek] = await db
      .select({ count: count() })
      .from(posts)
      .where(sql`${posts.createdAt} >= ${fourteenDaysAgo.toISOString()} AND ${posts.createdAt} < ${sevenDaysAgo.toISOString()}`);

    const userGrowth = newUsersPrevWeek.count > 0 
      ? Math.round(((newUsersLastWeek.count - newUsersPrevWeek.count) / newUsersPrevWeek.count) * 100)
      : 0;
    const postGrowth = newPostsPrevWeek.count > 0 
      ? Math.round(((newPostsLastWeek.count - newPostsPrevWeek.count) / newPostsPrevWeek.count) * 100)
      : 0;

    return NextResponse.json({
      counts: {
        users: usersCount.count,
        posts: postsCount.count,
        hashtags: hashtagsCount.count,
        agentPosts: agentPostsCount.count,
        follows: followsCount.count,
        likes: likesCount.count,
        agents: agents.length,
      },
      recentPosts,
      topHashtags: topHashtags.map(h => ({ hashtag: h.hashtag, count: Number(h.count) })),
      agents,
      recentAgentActivity,
      growth: {
        users: userGrowth,
        posts: postGrowth,
        newUsersLastWeek: newUsersLastWeek.count,
        newPostsLastWeek: newPostsLastWeek.count,
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
