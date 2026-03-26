import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, users, postHashtags } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/hashtags/[tag] - Get posts by hashtag with pagination
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tag: string }> }
) {
  try {
    const { tag } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;
    const hashtag = tag.toLowerCase();

    // Get posts with this hashtag
    const postsWithHashtags = await db
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
      .innerJoin(postHashtags, eq(posts.id, postHashtags.postId))
      .where(eq(postHashtags.hashtag, hashtag))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    const hasMore = postsWithHashtags.length === limit;

    // Add author info
    const postsWithAuthors = await Promise.all(
      postsWithHashtags.map(async (post) => {
        const [author] = await db
          .select({ name: users.name, username: users.username })
          .from(users)
          .where(eq(users.id, post.authorId))
          .limit(1);
        return {
          ...post,
          authorName: author?.name || author?.username || 'Unknown',
        };
      })
    );

    return NextResponse.json({ 
      hashtag,
      posts: postsWithAuthors,
      hasMore,
      page,
      count: postsWithAuthors.length 
    });
  } catch (error) {
    console.error('Get hashtag posts error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
