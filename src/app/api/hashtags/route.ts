import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';

// GET /api/hashtags - Get trending hashtags
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase();

    // Get all posts
    const allPosts = await db
      .select({
        serverSlug: posts.serverSlug,
      })
      .from(posts)
      .limit(500);

    // Count posts per server/slug
    const serverCounts: Record<string, number> = {};
    allPosts.forEach(post => {
      const slug = post.serverSlug || 'alcatelz';
      serverCounts[slug] = (serverCounts[slug] || 0) + 1;
    });

    // Convert to array and sort by count
    const trending = Object.entries(serverCounts)
      .map(([slug, count]) => ({ slug, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Filter by query if provided
    const filtered = query
      ? trending.filter(t => t.slug.toLowerCase().includes(query))
      : trending;

    return NextResponse.json({ hashtags: filtered }, { status: 200 });
  } catch (error) {
    console.error('Get hashtags error:', error);
    return NextResponse.json({ error: 'Failed to fetch hashtags' }, { status: 500 });
  }
}
