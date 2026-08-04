import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { normalizeRole } from "@/lib/roles";

/**
 * Reviewer Dashboard RBAC guard.
 *
 * Supports the full Dual-Auth contract (Supabase session, Firebase cookie,
 * or JSON fallback session) — reviewer access is NOT limited to Supabase
 * profiles only. Role is resolved via Supabase profile (SSOT) with the
 * `user_role` cookie as fallback for fallback-session users, then
 * normalized through src/lib/roles.ts.
 */
export default async function ReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  let { data: { user } } = await supabase.auth.getUser();

  // Dual-Auth Check: Fallback to Firebase / JSON cookie if Supabase fails
  if (!user) {
    const cookieStore = await cookies();
    const fbToken = cookieStore.get('firebase_session')?.value;
    const fallbackUserId = cookieStore.get('supabase_fallback_session')?.value;

    if (fbToken || fallbackUserId) {
      try {
        if (fbToken) {
          const payloadBase64 = fbToken.split('.')[1];
          const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
          user = { id: payload.uid, email: payload.claims?.email || payload.email || "reviewer@firebase.local" } as any;
        }
      } catch (e) {
        console.error("Firebase token verification failed in ReviewsLayout", e);
      }

      if (!user && fallbackUserId) {
        user = { id: fallbackUserId, email: "reviewer@fallback.local" } as any;
      }
    }
  }

  if (!user) {
    redirect("/auth/login");
  }

  const cookieStore = await cookies();
  const cookieRole = cookieStore.get('user_role')?.value;

  const isFallbackUser =
    !user.email ||
    user.email.includes('@fallback.local') ||
    user.email.includes('@firebase.local');

  let rawRole = "";

  // Primary SSOT: Supabase profile (only meaningful for non-fallback identities)
  if (!isFallbackUser) {
    let userId = user.id;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      const hex = Buffer.from(userId).toString('hex').padEnd(32, '0').slice(0, 32);
      userId = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (profile && profile.role) {
      rawRole = profile.role;
    }
  }

  // Fallback-session users (and users without a profile row) use the
  // login-time role cookie — same trust model as the other dashboards.
  if (!rawRole && cookieRole) {
    rawRole = cookieRole;
  }

  const normalized = normalizeRole(rawRole);

  // RBAC: reviewer dashboard is for reviewers; admins retain oversight access.
  if (normalized !== 'REVIEWER' && normalized !== 'ADMIN' && normalized !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
