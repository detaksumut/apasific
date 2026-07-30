import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

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

  const roleLower = userRole.toLowerCase();
  
  if (roleLower !== "admin" && roleLower !== "superadmin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
