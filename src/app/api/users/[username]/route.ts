import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, follows, posts } from '@/lib/db/schema';
import { eq, count, and } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    
    // Get user by username
    const user = await db.query.users.findFirst({
      where: eq(users.username, username)
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get current user (for follow status)
    const authUser = await getAuthUser();
    
    // Get stats
    const [postsCount] = await db.select({ count: count() })
      .from(posts)
      .where(eq(posts.authorId, user.id));
    
    const [followersCount] = await db.select({ count: count() })
      .from(follows)
      .where(eq(follows.followingId, user.id));
    
    const [followingCount] = await db.select({ count: count() })
      .from(follows)
      .where(eq(follows.followerId, user.id));

    // Check if current user follows this user
    let isFollowing = false;
    if (authUser && authUser.id !== user.id) {
      const existingFollow = await db.query.follows.findFirst({
        where: and(
          eq(follows.followerId, authUser.id),
          eq(follows.followingId, user.id)
        )
      });
      isFollowing = !!existingFollow;
    }

    // Remove password from response
    const { ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      stats: {
        posts: postsCount?.count || 0,
        followers: followersCount?.count || 0,
        following: followingCount?.count || 0,
      },
      isFollowing,
    });
  } catch (e) {
    console.error('Error fetching user:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
