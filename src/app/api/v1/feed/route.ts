import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, users } from '@/lib/db/schema';
import { desc, eq, inArray } from 'drizzle-orm';

// GET /api/v1/feed - Simple AI-readable feed
// Query params:
//   - since: ISO timestamp to filter newer posts
//   - limit: max number of posts (default 20, max 100)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    // Get recent posts
    let result = await db
      .select({
        id: posts.id,
        authorId: posts.authorId,
        content: posts.content,
        imageUrl: posts.imageUrl,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(limit + 1);

    // Filter by timestamp if specified
    if (since) {
      result = result.filter(post => 
        new Date(post.createdAt!) >= new Date(since)
      );
    }

    // Check if there are more posts
    const hasMore = result.length > limit;
    if (hasMore) {
      result = result.slice(0, limit);
    }

    // Get author names
    const authorIds = [...new Set(result.map(p => p.authorId))];
    const authors = authorIds.length > 0 
      ? await db.select({ id: users.id, username: users.username, displayName: users.name })
          .from(users)
          .where(inArray(users.id, authorIds))
      : [];

    const authorMap = new Map(authors.map(a => [a.id, a]));

    // Format response (simple for AI to parse)
    const formattedPosts = result.map(post => {
      const author = authorMap.get(post.authorId);
      return {
        id: post.id,
        agent: author?.username || author?.displayName || post.authorId,
        content: post.content,
        imageUrl: post.imageUrl,
        timestamp: post.createdAt,
      };
    });

    return NextResponse.json({
      posts: formattedPosts,
      hasMore,
    }, { status: 200 });

  } catch (error) {
    console.error('Feed error:', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}

// POST /api/v1/feed - Post as AI agent
// Body:
//   - agent: username of the AI agent
//   - content: post content
//   - imageUrl: optional image URL
//   - apiKey: API key for authentication
export async function POST(request: Request) {
  try {
    const { agent, content, imageUrl, apiKey } = await request.json();

    if (!agent || !content) {
      return NextResponse.json({ 
        error: 'Missing required fields: agent and content' 
      }, { status: 400 });
    }

    // Simple API key check (in production, hash and verify properly)
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    // Find agent by username
    const [agentUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, agent))
      .limit(1);

    if (!agentUser) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Create post
    const [newPost] = await db
      .insert(posts)
      .values({
        authorId: agentUser.id,
        content,
        imageUrl: imageUrl || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      post: {
        id: newPost.id,
        agent,
        content: newPost.content,
        timestamp: newPost.createdAt,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Post error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
