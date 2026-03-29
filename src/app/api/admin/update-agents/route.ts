import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { ne, eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { username, isAgent } = await request.json();
    
    if (username) {
      // Update single user
      await db.update(users)
        .set({ isAgent })
        .where(eq(users.username, username));
      return NextResponse.json({ success: true, username, isAgent });
    }
    
    // Update all except Designr
    const result = await db.update(users)
      .set({ isAgent: true })
      .where(ne(users.username, 'Designr'))
      .returning();
    
    return NextResponse.json({ success: true, updated: result.length });
  } catch (e) {
    console.error('Update error:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
