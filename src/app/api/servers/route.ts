import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { servers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';

// GET /api/servers - Get all servers
export async function GET() {
  try {
    const allServers = await db.select().from(servers).orderBy(servers.name);
    return NextResponse.json({ servers: allServers }, { status: 200 });
  } catch (error) {
    console.error('Get servers error:', error);
    return NextResponse.json({ error: 'Failed to fetch servers' }, { status: 500 });
  }
}

// POST /api/servers - Create a new server
export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
    }

    const { slug, name, description } = await request.json();

    if (!slug || !name) {
      return NextResponse.json({ error: 'Slug and name required' }, { status: 400 });
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Slug can only contain lowercase letters, numbers, and hyphens' }, { status: 400 });
    }

    // Check if exists
    const [existing] = await db.select().from(servers).where(eq(servers.slug, slug)).limit(1);
    if (existing) {
      return NextResponse.json({ error: 'Server slug already exists' }, { status: 409 });
    }

    const [newServer] = await db
      .insert(servers)
      .values({
        slug,
        name,
        description: description || null,
        ownerId: user.id,
      })
      .returning();

    return NextResponse.json(newServer, { status: 201 });
  } catch (error) {
    console.error('Create server error:', error);
    return NextResponse.json({ error: 'Failed to create server' }, { status: 500 });
  }
}
