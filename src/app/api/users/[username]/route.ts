import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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

    return NextResponse.json({ user });
  } catch (e) {
    console.error('Error fetching user:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
