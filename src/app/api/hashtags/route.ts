import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { postHashtags } from '@/lib/db/schema';
import { sql, desc, like } from 'drizzle-orm';

// GET /api/hashtags - List/search hashtags with pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    let hashtagCounts;
    
    if (query && query.length > 0) {
      // Search hashtags matching query
      hashtagCounts = await db
        .select({
          hashtag: postHashtags.hashtag,
          count: sql<number>`count(*)`,
        })
        .from(postHashtags)
        .where(like(postHashtags.hashtag, `%${query}%`))
        .groupBy(postHashtags.hashtag)
        .orderBy(desc(sql`count(*)`))
        .limit(limit)
        .offset(query ? 0 : offset); // No offset for search
    } else {
      // Get all hashtags with counts
      hashtagCounts = await db
        .select({
          hashtag: postHashtags.hashtag,
          count: sql<number>`count(*)`,
        })
        .from(postHashtags)
        .groupBy(postHashtags.hashtag)
        .orderBy(desc(sql`count(*)`))
        .limit(limit)
        .offset(offset);
    }

    const hasMore = hashtagCounts.length === limit;

    return NextResponse.json({ 
      hashtags: hashtagCounts,
      total: hashtagCounts.length,
      hasMore,
      page
    });
  } catch (error) {
    console.error('List hashtags error:', error);
    return NextResponse.json({ error: 'Failed to fetch hashtags' }, { status: 500 });
  }
}
