import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');
  const role = searchParams.get('role') || 'author';
  const name = searchParams.get('name') || 'Impersonated User';

  if (!uid) {
    return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
  }

  const cookieStore = await cookies();
  
  // Set the cookies needed for the dashboard to recognize the user
  cookieStore.set('user_role', role, { path: '/' });
  cookieStore.set('user_name', encodeURIComponent(name), { path: '/' });
  // We use a properly formatted dummy JWT so .split('.')[1] doesn't crash the server
  cookieStore.set('firebase_session', 'dummy.eyJ1aWQiOiJkdW1teSJ9.dummy', { path: '/' });
  cookieStore.set('supabase_fallback_session', uid, { path: '/' });

  // Redirect to author dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
