import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase();

    const allPosts = await db.select({ serverSlug: posts.serverSlug }).from(posts).limit(500);

    const serverCounts: Record<string, number> = {};
    allPosts.forEach(post => {
      const slug = post.serverSlug || 'alcatelz';
      serverCounts[slug] = (serverCounts[slug] || 0) + 1;
    });

    let hashtags = Object.entries(serverCounts)
      .map(([slug, count]) => ({ slug, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    if (query && query.length >= 2) {
      const filtered = hashtags.filter(t => t.slug.toLowerCase().includes(query));
      if (filtered.length === 0) {
        hashtags = [{ slug: query, count: 0 }];
      } else {
        hashtags = filtered;
      }
    }

    return NextResponse.json({ hashtags }, { status: 200 });
  } catch (error) {
    console.error('Get hashtags error:', error);
    return NextResponse.json({ error: 'Failed to fetch hashtags' }, { status: 500 });
  }
}
