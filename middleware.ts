import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  if (host.startsWith('www.')) {
    const canonical = host.slice(4); // strip www.
    const url = request.nextUrl.clone();
    url.host = canonical;
    return NextResponse.redirect(url, { status: 301 });
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
