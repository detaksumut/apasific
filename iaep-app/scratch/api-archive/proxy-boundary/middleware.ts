import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

/**
 * IAEP Next.js Middleware
 *
 * Responsibilities:
 * 1. Refresh Supabase auth session on every matched request
 * 2. Keep token from expiring between navigations
 * 3. Block debug/internal API routes in production (Phase 5)
 *
 * Route-specific protection (redirect unauthenticated users) is handled
 * by individual layout.tsx files: DashboardLayout / EditorLayout / AdminLayout.
 *
 * IAEP Session Contract v1:
 *   Primary:    Supabase auth session (managed by updateSession)
 *   Fallback:   supabase_fallback_session cookie
 *   Legacy:     firebase_session cookie
 *   Deprecated: apasific_session (removed — was never set by auth.ts)
 */

// Debug route prefixes that must be blocked in production.
// Adding a new debug route? Use the prefix pattern here — no need to edit each file.
const DEBUG_ROUTE_PATTERNS = [
  '/api/check',
  '/api/debug',
  '/api/fix-',
  '/api/test',
  '/api/seed-',
  '/api/migrate',
  '/api/reset-',
  '/api/inspect',
  '/api/sync-',
  '/api/dump',
  '/api/repair',
  '/api/recover',
  '/api/git-push',
  '/api/impersonate',
  '/api/session-debug',
  '/api/kadsumut-check',
  '/api/import-all-users',
  '/api/generate-missing',
  '/api/run-header-translation-sync',
  '/api/force-assign',
  '/api/delete-dummy',
  '/api/clean-',
  '/api/create-users',
  '/api/ensure-',
  '/api/find-submission',
  '/api/backup-',
  '/api/add-',
  '/api/count-',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Phase 5: Block debug routes in production
  if (process.env.NODE_ENV !== 'development') {
    const isDebugRoute = DEBUG_ROUTE_PATTERNS.some((p) => pathname.startsWith(p));
    if (isDebugRoute) {
      return NextResponse.json(
        { error: 'Not available in production.' },
        { status: 404 }
      );
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
    "/api/:path*",
  ],
};
