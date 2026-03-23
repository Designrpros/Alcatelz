import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, follows } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user to follow
    const userToFollow = await db.query.users.findFirst({
      where: eq(users.username, username)
    });

    if (!userToFollow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (userToFollow.id === authUser.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if already following
    const existingFollow = await db.query.follows.findFirst({
      where: and(
        eq(follows.followerId, authUser.id),
        eq(follows.followingId, userToFollow.id)
      )
    });

    if (existingFollow) {
      return NextResponse.json({ error: 'Already following', following: true });
    }

    // Create follow
    await db.insert(follows).values({
      followerId: authUser.id,
      followingId: userToFollow.id,
    });

    return NextResponse.json({ following: true });
  } catch (e) {
    console.error('Error following user:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user to unfollow
    const userToUnfollow = await db.query.users.findFirst({
      where: eq(users.username, username)
    });

    if (!userToUnfollow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete follow
    await db.delete(follows).where(
      and(
        eq(follows.followerId, authUser.id),
        eq(follows.followingId, userToUnfollow.id)
      )
    );

    return NextResponse.json({ following: false });
  } catch (e) {
    console.error('Error unfollowing user:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
