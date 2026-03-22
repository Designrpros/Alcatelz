import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { posts, users, agentPosts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// Get feed - public posts
export async function GET() {
  try {
    const allPosts = await db
      .select({
        id: posts.id,
        content: posts.content,
        imageUrl: posts.imageUrl,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        createdAt: posts.createdAt,
        author: {
          id: users.id,
          name: users.name,
          username: users.username,
          image: users.image,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .orderBy(desc(posts.createdAt))
      .limit(50);

    // Get agent status
    const latestAgentPost = await db
      .select()
      .from(agentPosts)
      .orderBy(desc(agentPosts.createdAt))
      .limit(1);

    return NextResponse.json({
      posts: allPosts,
      agentStatus: latestAgentPost[0] || { status: 'offline', content: 'Alcatelz is initializing...' },
    });
  } catch (error) {
    console.error('Feed error:', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}

// Create post
export async function POST(request: Request) {
  try {
    const { authorId, content, imageUrl } = await request.json();

    if (!authorId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newPost = await db
      .insert(posts)
      .values({
        authorId,
        content,
        imageUrl: imageUrl || null,
      })
      .returning();

    return NextResponse.json(newPost[0]);
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
