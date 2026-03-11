import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { sql } from '@/lib/db';

// DELETE /api/user/account — delete the current user's account
// Cascades to positions, sessions, accounts, verifications via FK ON DELETE CASCADE
export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  if (!sql) return NextResponse.json({ error: 'DB not configured' }, { status: 500 });

  try {
    // Deleting from "user" cascades to: sessions, accounts, verifications, positions
    await sql`DELETE FROM "user" WHERE id = ${userId}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/user/account] DELETE failed:', e);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
