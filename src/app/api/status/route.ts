import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { agentPosts } from '@/lib/db/schema';

// POST /api/status - Update agent status
export async function POST(request: Request) {
  try {
    const { content, status } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Missing required field: content' }, { status: 400 });
    }

    const newStatus = await db
      .insert(agentPosts)
      .values({
        content,
        status: status || 'working', // idle, working, thinking
      })
      .returning();

    return NextResponse.json(newStatus[0]);
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json({ error: 'Failed to update agent status' }, { status: 500 });
  }
}
