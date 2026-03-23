import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, users, notifications, sessions, comments } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { notifyNewPost } from '@/lib/telegram-notify';
import { getAutoReply } from '@/lib/ai-reply';

const SESSION_COOKIE = 'alcatelz_session';

function getUserIdFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match ? match[1] : null;
}

// GET /api/posts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serverSlug = searchParams.get('server') || 'alcatelz';

    const allPosts = await db
      .select({
        id: posts.id,
        authorId: posts.authorId,
        content: posts.content,
        imageUrl: posts.imageUrl,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        serverSlug: posts.serverSlug,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .where(eq(posts.serverSlug, serverSlug))
      .orderBy(desc(posts.createdAt))
      .limit(50);

    const postsWithAuthors = await Promise.all(
      allPosts.map(async (post) => {
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

    return NextResponse.json({ posts: postsWithAuthors }, { status: 200 });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST /api/posts
export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const sessionId = getUserIdFromCookies(cookieHeader);
    
    if (!sessionId) {
      return NextResponse.json({ error: 'You must be logged in to post' }, { status: 401 });
    }

    const [sessionData] = await db
      .select({ userId: sessions.userId })
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!sessionData) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, sessionData.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const { content, imageUrl, serverSlug } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: 'Content too long (max 5000 characters)' }, { status: 400 });
    }

    const targetServer = serverSlug || 'alcatelz';

    const [newPost] = await db
      .insert(posts)
      .values({
        authorId: user.id,
        content: content.trim(),
        imageUrl: imageUrl || null,
        serverSlug: targetServer,
      })
      .returning();

    // Send Telegram notification
    await notifyNewPost(user.username, content, newPost.id);

    // Notify all admins in database
    try {
      const admins = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.role, 'admin'))
        .execute();

      for (const admin of admins) {
        await db
          .insert(notifications)
          .values({
            userId: admin.id,
            type: 'new_post',
            message: `${user.name || user.username} postet: ${content.slice(0, 50)}...`,
            link: `/post/${newPost.id}`,
            read: false,
          })
          .execute();
      }
    } catch (error) {
      console.error('notifyAllAdmins error:', error);
    }

    // AI Auto-reply from Alcatelz
    const autoReply = getAutoReply(user.username);
    if (autoReply && user.username !== 'alcatelz') {
      try {
        // Find Alcatelz user
        const [alcatelz] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.username, 'alcatelz'))
          .limit(1);

        if (alcatelz) {
          // Add comment from Alcatelz
          await db
            .insert(comments)
            .values({
              postId: newPost.id,
              authorId: alcatelz.id,
              content: autoReply,
            })
            .execute();

          // Update comments count
          await db
            .update(posts)
            .set({ commentsCount: (newPost.commentsCount || 0) + 1 })
            .where(eq(posts.id, newPost.id))
            .execute();
        }
      } catch (error) {
        console.error('AI auto-reply error:', error);
      }
    }

    return NextResponse.json({
      ...newPost,
      authorName: user.name || user.username,
    }, { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
