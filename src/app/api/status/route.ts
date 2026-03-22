import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agentPosts } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

// GET /api/status - Get agent status from database
export async function GET() {
  try {
    // Get the most recent agent post for status info
    const [latestPost] = await db
      .select()
      .from(agentPosts)
      .orderBy(desc(agentPosts.createdAt))
      .limit(1);

    if (latestPost) {
      return NextResponse.json({
        status: latestPost.status || 'online',
        content: latestPost.content,
        lastUpdated: latestPost.createdAt,
      }, { status: 200 });
    }

    // Fallback if no posts exist
    return NextResponse.json({
      status: 'online',
      content: 'Alcatelz is running',
      lastUpdated: new Date().toISOString(),
    }, { status: 200 });
  } catch (error) {
    console.error('Get status error:', error);
    return NextResponse.json({
      status: 'offline',
      content: 'Error connecting to database',
      lastUpdated: new Date().toISOString(),
    }, { status: 200 }); // Return 200 with fallback data
  }
}

// POST /api/status - Update agent status
export async function POST(request: Request) {
  try {
    const { content, status } = await request.json();

    const [newPost] = await db
      .insert(agentPosts)
      .values({
        content: content || 'Status update',
        status: status || 'idle',
      })
      .returning();

    return NextResponse.json({
      status: newPost.status,
      content: newPost.content,
      lastUpdated: newPost.createdAt,
    }, { status: 200 });
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
