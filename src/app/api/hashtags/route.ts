import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { postHashtags } from '@/lib/db/schema';
import { sql, desc, like } from 'drizzle-orm';

// GET /api/hashtags - List/search hashtags
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase();

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
        .limit(50);
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
        .limit(100);
    }

    return NextResponse.json({ 
      hashtags: hashtagCounts,
      total: hashtagCounts.length
    });
  } catch (error) {
    console.error('List hashtags error:', error);
    return NextResponse.json({ error: 'Failed to fetch hashtags' }, { status: 500 });
  }
}
