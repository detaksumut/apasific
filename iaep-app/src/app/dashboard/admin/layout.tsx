import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/app/actions/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let userRole = "author";
  let isAuthenticated = false;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      isAuthenticated = true;
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile) {
        userRole = profile.role || userRole;
      }
    } else {
      const cookieStore = await cookies();
      const cookieRole = cookieStore.get('user_role')?.value;
      if (cookieRole) {
        isAuthenticated = true;
        userRole = cookieRole;
      }
    }
  } catch {}

  const identity = await getCurrentUser();
  if (identity?.email && identity.email.toLowerCase() === "danil@apasific.org") {
    redirect("/dashboard/production/supervisor");
  }

  const configuredSuperAdminEmail = process.env.SUPER_ADMIN_CANONICAL_EMAIL || process.env.SUPER_ADMIN_EMAIL;
  const isConfiguredSuperAdmin = !!identity?.email && !!configuredSuperAdminEmail && identity.email.toLowerCase() === configuredSuperAdminEmail.toLowerCase();

  const roleLower = userRole.toLowerCase();

  // RBAC: consistent with permissions.ts isAdmin() — supports all three variants
  const isAdmin = isConfiguredSuperAdmin || ["admin", "superadmin", "super_admin"].includes(roleLower);
  if (!isAdmin) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
