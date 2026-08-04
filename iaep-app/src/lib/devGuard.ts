import { NextResponse } from 'next/server';

/**
 * IAEP Dev Guard
 *
 * Returns a 404 response in production for any debug/internal API route.
 * Usage in any debug route:
 *
 *   import { devGuard } from '@/lib/devGuard';
 *   export async function GET() {
 *     const blocked = devGuard();
 *     if (blocked) return blocked;
 *     // ... rest of handler
 *   }
 */
export function devGuard(): NextResponse | null {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not available in production.' },
      { status: 404 }
    );
  }
  return null;
}
