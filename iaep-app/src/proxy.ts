import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

/**
 * APASIFIC Edge Delivery Proxy (formerly Middleware)
 * Runs globally on the Edge Network (e.g., Vercel Edge / Cloudflare Workers).
 * Ensures geographic latency reduction and immediate boundary protection before hitting core servers.
 */
export async function proxy(request: NextRequest) {
  // 1. Edge Caching & Static Routes Bypass
  if (
    request.nextUrl.pathname.startsWith('/_next') || 
    request.nextUrl.pathname.includes('/static/')
  ) {
    return NextResponse.next();
  }

  // 2. Global Security Headers Injection & Supabase Auth
  const response = await updateSession(request);
  response.headers.set('X-Edge-Region', (request as any).geo?.region || 'unknown');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // 3. Fast-Fail Auth Validation (JWT Syntax Check at the Edge)
  const authCookie = request.cookies.get('apasific_session');
  if (request.nextUrl.pathname.startsWith('/dashboard') && !authCookie) {
    // Redirect unauthenticated users immediately without waking up the origin server
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

// Limit proxy execution to specific routes to minimize latency overhead
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
