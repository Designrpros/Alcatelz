/* eslint-disable */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comments, users, posts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAutoReply } from '@/lib/ai-reply';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    // Support both ?postId= and /[id]/comments/[id] patterns
    const postId = url.searchParams.get('postId') || url.pathname.split('/')[3];

    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    const allComments: any[] = await db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(comments.createdAt)
      .execute();

    if (allComments.length === 0) {
      return NextResponse.json({ comments: [] }, { status: 200 });
    }

    const authorsResult: any[] = await db
      .select({ id: users.id, name: users.name, username: users.username })
      .from(users)
      .execute();

    const authorMap = new Map(authorsResult.map((a: any) => [a.id, a]));

    const commentMap = new Map();
    const rootComments: any[] = [];

    for (const comment of allComments) {
      const author = authorMap.get(comment.authorId);
      commentMap.set(comment.id, {
        ...comment,
        authorName: author?.name || author?.username || 'Unknown',
        authorUsername: author?.username || 'unknown',
        replies: [],
      });
    }

    for (const comment of allComments) {
      const commentObj: any = commentMap.get(comment.id);
      if (comment.parentId && commentMap.has(comment.parentId)) {
        const parent: any = commentMap.get(comment.parentId);
        parent.replies.push(commentObj);
      } else {
        rootComments.push(commentObj);
      }
    }

    return NextResponse.json({ comments: rootComments }, { status: 200 });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const postId = url.searchParams.get('postId') || url.pathname.split('/')[3];

    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    const { content, parentId } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 });
    }

    // Get session from cookie
    const cookieHeader = request.headers.get('cookie');
    const sessionId = cookieHeader?.match(/alcatelz_session=([^;]+)/)?.[1];

    if (!sessionId) {
      return NextResponse.json({ error: 'Must be logged in' }, { status: 401 });
    }

    const [sessionData]: any = await db
      .select({ userId: users.id })
      .from(users)
      .limit(1)
      .execute();

    if (!sessionData) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const userId = sessionData.userId;

    let depth = 0;
    if (parentId) {
      const [parent]: any = await db
        .select({ depth: comments.depth })
        .from(comments)
        .where(eq(comments.id, parentId))
        .limit(1)
        .execute();
      if (parent) depth = Math.min(parent.depth + 1, 5);
    }

    const [newComment]: any = await db
      .insert(comments)
      .values({
        postId,
        authorId: userId,
        content: content.trim(),
        parentId: parentId || null,
        depth,
      })
      .returning()
      .execute();

    // AI auto-reply
    if (!parentId) {
      const [author]: any = await db
        .select({ username: users.username })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
        .execute();

      const autoReply = getAutoReply(author?.username || '');
      if (autoReply) {
        try {
          const [alcatelz]: any = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.username, 'alcatelz'))
            .limit(1)
            .execute();

          if (alcatelz) {
            await db
              .insert(comments)
              .values({
                postId,
                authorId: alcatelz.id,
                content: autoReply,
                parentId: newComment.id,
                depth: 1,
              })
              .execute();
          }
        } catch (e) {
          console.error('AI reply error:', e);
        }
      }
    }

    return NextResponse.json({
      ...newComment,
      authorUsername: 'you',
      replies: [],
    }, { status: 201 });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
