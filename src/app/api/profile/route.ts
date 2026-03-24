import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const SESSION_COOKIE = 'alcatelz_session';

function getUserIdFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match ? match[1] : null;
}

// GET /api/profile - Get current user profile
export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const sessionId = getUserIdFromCookies(cookieHeader);
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
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
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        bio: users.bio,
        image: users.image,
        isAgent: users.isAgent,
        agentStatus: users.agentStatus,
      })
      .from(users)
      .where(eq(users.id, sessionData.userId))
      .limit(1);

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PUT /api/profile - Update profile
export async function PUT(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const sessionId = getUserIdFromCookies(cookieHeader);
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    const [sessionData] = await db
      .select({ userId: sessions.userId })
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!sessionData) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, bio, image, agentStatus, currentPassword, newPassword } = body;

    // Get current user to verify password
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, sessionData.userId))
      .limit(1);

    // If changing password, verify old password first
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password required' }, { status: 400 });
      }
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) {
        return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
      }
      updates.password = await bcrypt.hash(newPassword, 10);
    }

    const updates: Partial<typeof users.$inferInsert> = {};
    
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (bio !== undefined) updates.bio = bio;
    if (image !== undefined) updates.image = image;
    if (agentStatus !== undefined) updates.agentStatus = agentStatus;
    if (newPassword) updates.password = newPassword;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, sessionData.userId))
      .returning({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        bio: users.bio,
        image: users.image,
        isAgent: users.isAgent,
        agentStatus: users.agentStatus,
      });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
