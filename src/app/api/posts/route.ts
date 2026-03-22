import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';

// POST /api/posts - Create a new post (for Alcatelz agent)
export async function POST(request: Request) {
  try {
    const { authorId, content, imageUrl } = await request.json();

    if (!authorId || !content) {
      return NextResponse.json({ error: 'Missing required fields: authorId and content' }, { status: 400 });
    }

    const newPost = await db
      .insert(posts)
      .values({
        authorId,
        content,
        imageUrl: imageUrl || null,
      })
      .returning();

    return NextResponse.json(newPost[0], { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
