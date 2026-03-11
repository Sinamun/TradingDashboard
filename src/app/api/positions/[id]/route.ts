import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { sql } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  if (!sql) return NextResponse.json({ error: 'DB not configured' }, { status: 500 });

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { ticker, display_name, yahoo_ticker, asset_type, entry_price, quantity, currency, platform, strike, expiry, source, notes } = body;

  if (!ticker || typeof ticker !== 'string' || !ticker.trim()) {
    return NextResponse.json({ error: 'ticker is required' }, { status: 400 });
  }
  if (!['stock', 'call', 'put'].includes(String(asset_type ?? ''))) {
    return NextResponse.json({ error: 'invalid asset_type' }, { status: 400 });
  }
  if (!entry_price || isNaN(Number(entry_price)) || Number(entry_price) <= 0) {
    return NextResponse.json({ error: 'invalid entry_price' }, { status: 400 });
  }
  if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
    return NextResponse.json({ error: 'invalid quantity' }, { status: 400 });
  }
  if (!['USD', 'GBP', 'EUR', 'GBX'].includes(String(currency ?? ''))) {
    return NextResponse.json({ error: 'invalid currency' }, { status: 400 });
  }

  const isOption = asset_type === 'call' || asset_type === 'put';

  try {
    await sql.transaction([
      sql`SELECT set_config('app.current_user_id', ${userId}, true)`,
      sql`
        UPDATE positions SET
          ticker       = ${String(ticker).trim().toUpperCase()},
          display_name = ${display_name ? String(display_name).trim() : null},
          yahoo_ticker = ${yahoo_ticker ? String(yahoo_ticker).trim().toUpperCase() : null},
          asset_type   = ${String(asset_type)},
          entry_price  = ${Number(entry_price)},
          quantity     = ${Number(quantity)},
          currency     = ${String(currency)},
          platform     = ${platform ? String(platform) : 'ibkr'},
          strike       = ${isOption && strike ? Number(strike) : null},
          expiry       = ${isOption && expiry ? String(expiry) : null},
          source       = ${source ? String(source).trim() : null},
          notes        = ${notes ? String(notes).trim() : null}
        WHERE id = ${id}::uuid AND user_id = ${userId}
      `,
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/positions/[id]] PATCH failed:', e);
    return NextResponse.json({ error: 'Failed to update position' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  if (!sql) return NextResponse.json({ error: 'DB not configured' }, { status: 500 });

  const { id } = await params;

  try {
    await sql.transaction([
      sql`SELECT set_config('app.current_user_id', ${userId}, true)`,
      sql`DELETE FROM positions WHERE id = ${id}::uuid AND user_id = ${userId}`,
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/positions/[id]] DELETE failed:', e);
    return NextResponse.json({ error: 'Failed to delete position' }, { status: 500 });
  }
}
