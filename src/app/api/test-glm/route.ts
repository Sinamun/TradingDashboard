import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GLM_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'GLM_KEY not set', envKeys: Object.keys(process.env).filter(k => k.includes('GLM')) });
  }

  try {
    const res = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'GLM-5',
        messages: [
          { role: 'user', content: 'Say "hello" and nothing else.' },
        ],
        max_tokens: 10,
      }),
      signal: AbortSignal.timeout(15000),
    });

    const status = res.status;
    const body = await res.text();
    
    return NextResponse.json({
      glmKeyPrefix: apiKey.substring(0, 8) + '...',
      glmKeyLength: apiKey.length,
      status,
      body: body.substring(0, 500),
    });
  } catch (e) {
    return NextResponse.json({
      glmKeyPrefix: apiKey.substring(0, 8) + '...',
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
