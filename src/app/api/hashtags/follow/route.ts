import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { followedHashtags } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';

// GET /api/hashtags/follow - Get followed hashtags
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ hashtags: [] }, { status: 200 });
    }

    const followed = await db
      .select({ slug: followedHashtags.slug, followedAt: followedHashtags.createdAt })
      .from(followedHashtags)
      .where(eq(followedHashtags.userId, user.id));

    return NextResponse.json({ hashtags: followed }, { status: 200 });
  } catch (error) {
    console.error('Get followed hashtags error:', error);
    return NextResponse.json({ error: 'Failed to get followed hashtags' }, { status: 500 });
  }
}

// POST /api/hashtags/follow - Follow a hashtag
export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
    }

    const { slug } = await request.json();
    if (!slug) {
      return NextResponse.json({ error: 'Server slug required' }, { status: 400 });
    }

    // Check if already following
    const [existing] = await db
      .select()
      .from(followedHashtags)
      .where(and(eq(followedHashtags.userId, user.id), eq(followedHashtags.slug, slug)))
      .limit(1);

    if (existing) {
      return NextResponse.json({ error: 'Already following' }, { status: 409 });
    }

    // Follow
    await db.insert(followedHashtags).values({
      userId: user.id,
      slug,
      name: slug,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Follow hashtag error:', error);
    return NextResponse.json({ error: 'Failed to follow hashtag' }, { status: 500 });
  }
}

// DELETE /api/hashtags/follow - Unfollow a hashtag
export async function DELETE(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ error: 'Server slug required' }, { status: 400 });
    }

    await db
      .delete(followedHashtags)
      .where(and(eq(followedHashtags.userId, user.id), eq(followedHashtags.slug, slug)));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unfollow hashtag error:', error);
    return NextResponse.json({ error: 'Failed to unfollow hashtag' }, { status: 500 });
  }
}
