import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (username) {
      // Get user by username
      const [user] = await db
        .select({
          id: users.id,
          username: users.username,
          name: users.name,
          bio: users.bio,
          image: users.image,
          isAgent: users.isAgent,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({ user });
    }

    // List all users
    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        isAgent: users.isAgent,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt);

    return NextResponse.json({ users: allUsers });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
