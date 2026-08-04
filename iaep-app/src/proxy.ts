import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

/**
 * APASIFIC Edge Delivery Proxy (formerly Middleware)
 * Runs globally on the Edge Network (e.g., Vercel Edge / Cloudflare Workers).
 * Ensures geographic latency reduction and immediate boundary protection before hitting core servers.
 *
 * IAEP Session Contract v1:
 *   Primary:    Supabase auth session cookie `sb-<project-ref>-auth-token`
 *               (managed by updateSession in middleware.ts; recognized in step 3)
 *   Fallback:   supabase_fallback_session cookie
 *   Legacy:     firebase_session cookie
 *   Deprecated: apasific_session (removed — was never set by auth.ts)
 */

/**
 * Detects the primary Supabase Auth session cookie. supabase-js derives the
 * storage key as `sb-<project-ref>-auth-token` from NEXT_PUBLIC_SUPABASE_URL;
 * large sessions are stored as chunks (`<key>.0`, `<key>.1`, ...).
 * This is a presence check only — token validity is enforced by
 * updateSession() / supabase.auth.getUser().
 */
function hasSupabaseAuthSession(request: NextRequest): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return false;

  let projectRef = '';
  try {
    projectRef = new URL(supabaseUrl).hostname.split('.')[0] ?? '';
  } catch {
    return false;
  }
  if (!projectRef) return false;

  const key = `sb-${projectRef}-auth-token`;
  return request.cookies
    .getAll()
    .some(({ name }) => name === key || name.startsWith(`${key}.`));
}

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
  // Session Contract v1: Supabase Auth is the PRIMARY session source
  // (sb-<project-ref>-auth-token, incl. chunked cookies); kept fallbacks:
  // supabase_fallback_session (backup) and firebase_session (legacy).
  // apasific_session was removed — it was never set by auth.ts and caused false redirects.
  const session =
    hasSupabaseAuthSession(request) ||
    request.cookies.get('supabase_fallback_session') ||
    request.cookies.get('firebase_session');

  if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
    // Redirect unauthenticated users immediately without waking up the origin server.
    // Phase 2 fix: /auth/login (not /login which was a 404).
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return response;
}

// Limit proxy execution to specific routes to minimize latency overhead
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
