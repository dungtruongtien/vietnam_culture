import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';

  if (host.startsWith('www.')) {
    // Use x-forwarded-proto so the redirect is https:// in production behind Railway's proxy
    const proto = request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '');
    const canonical = host.slice(4).split(':')[0]; // strip www. and any port
    const redirectUrl = `${proto}://${canonical}${request.nextUrl.pathname}${request.nextUrl.search}`;
    return NextResponse.redirect(redirectUrl, { status: 301 });
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
