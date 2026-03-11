import { NextResponse } from 'next/server';
export async function GET() {
  const apiKey = process.env.OPENAI_KEY;
  if (!apiKey) return NextResponse.json({ error: 'OPENAI_KEY not set', keys: Object.keys(process.env).filter(k => k.includes('OPENAI')) });
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-5-mini', messages: [{ role: 'user', content: 'Say hello' }], max_tokens: 5 }),
      signal: AbortSignal.timeout(15000),
    });
    const body = await res.text();
    return NextResponse.json({ status: res.status, keyPrefix: apiKey.substring(0,8) + '...', body: body.substring(0, 300) });
  } catch (e) { return NextResponse.json({ error: String(e) }); }
}
