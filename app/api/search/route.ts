import { NextRequest, NextResponse } from 'next/server';
import { searchAll } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') || '';

  if (!q.trim() || q.length < 2) {
    return NextResponse.json({ provinces: [], events: [], cultural_posts: [] });
  }

  try {
    const results = await searchAll(q);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ provinces: [], events: [], cultural_posts: [] });
  }
}
