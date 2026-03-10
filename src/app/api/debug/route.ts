import { NextResponse } from 'next/server';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  return NextResponse.json({
    hasDbUrl: !!dbUrl,
    dbUrlPrefix: dbUrl ? dbUrl.substring(0, 30) + '...' : null,
    dbUrlLength: dbUrl?.length ?? 0,
    vercelEnv: process.env.VERCEL_ENV ?? 'not set',
    nodeEnv: process.env.NODE_ENV ?? 'not set',
  });
}
