import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  if (!sql) return NextResponse.json({ error: 'DB not configured' }, { status: 500 });

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
    const result = await sql.transaction([
      sql`SELECT set_config('app.current_user_id', ${userId}, true)`,
      sql`
        INSERT INTO positions (
          user_id, ticker, display_name, yahoo_ticker, asset_type,
          entry_price, quantity, currency, platform,
          strike, expiry, source, notes
        ) VALUES (
          ${userId},
          ${String(ticker).trim().toUpperCase()},
          ${display_name ? String(display_name).trim() : null},
          ${yahoo_ticker ? String(yahoo_ticker).trim().toUpperCase() : null},
          ${String(asset_type)},
          ${Number(entry_price)},
          ${Number(quantity)},
          ${String(currency)},
          ${platform ? String(platform) : 'ibkr'},
          ${isOption && strike ? Number(strike) : null},
          ${isOption && expiry ? String(expiry) : null},
          ${source ? String(source).trim() : null},
          ${notes ? String(notes).trim() : null}
        )
        RETURNING id::text
      `,
    ]);
    const rows = result[1] as Array<{ id: string }>;
    return NextResponse.json({ id: rows[0]?.id });
  } catch (e) {
    console.error('[api/positions] POST failed:', e);
    return NextResponse.json({ error: 'Failed to create position' }, { status: 500 });
  }
}
