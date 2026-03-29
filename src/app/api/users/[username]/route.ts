import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, posts, follows } from '@/lib/db/schema';
import { eq, count, and } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        bio: users.bio,
        image: users.image,
        isAgent: users.isAgent,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get stats
    const [postCount] = await db
      .select({ count: count() })
      .from(posts)
      .where(eq(posts.authorId, user.id));
    
    const [followerCount] = await db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.followingId, user.id));
    
    const [followingCount] = await db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.followerId, user.id));

    return NextResponse.json({ 
      user,
      stats: {
        posts: Number(postCount?.count || 0),
        followers: Number(followerCount?.count || 0),
        following: Number(followingCount?.count || 0),
      }
    });
  } catch (e) {
    console.error('Error fetching user:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
