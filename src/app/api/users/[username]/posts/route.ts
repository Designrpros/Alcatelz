import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, posts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    
    const user = await db.query.users.findFirst({
      where: eq(users.username, username)
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userPosts = await db.query.posts.findMany({
      where: eq(posts.authorId, user.id),
      orderBy: [desc(posts.createdAt)],
      limit: 50
    });

    return NextResponse.json({ posts: userPosts });
  } catch (e) {
    console.error('Error fetching posts:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
