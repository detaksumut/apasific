import { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  let userRole = "author";
  let userName = "User";

  try {
    const cookieStore = await cookies();
    
    // Read fallback cookies if they exist
    const cookieRole = cookieStore.get('user_role')?.value;
    const cookieName = cookieStore.get('user_name')?.value;
    
    if (cookieRole) userRole = cookieRole;
    if (cookieName) userName = decodeURIComponent(cookieName);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single();
      if (profile) {
        userRole = profile.role || userRole;
        userName = profile.full_name || user.email || userName;
      } else {
        userName = user.user_metadata?.full_name || user.email || userName;
      }
    }

    // Override UI role if user selected a different portal
    const activePortalRole = cookieStore.get('active_portal_role')?.value;
    if (activePortalRole && ['author', 'reviewer', 'editor', 'co_admin', 'admin'].includes(activePortalRole)) {
      // Validate that they don't escalate privileges.
      // (admin can be anything, editor can be reviewer/author, reviewer can be author)
      const allowedRolesForAdmin = ['admin', 'co_admin', 'editor', 'reviewer', 'author'];
      const allowedRolesForCoAdmin = ['co_admin', 'reviewer', 'author'];
      const allowedRolesForEditor = ['editor', 'reviewer', 'author'];
      const allowedRolesForReviewer = ['reviewer', 'author'];

      let isAllowed = false;
      if ((userRole === 'admin' || userRole === 'super_admin' || userRole === 'superadmin') && allowedRolesForAdmin.includes(activePortalRole)) isAllowed = true;
      if (userRole === 'co_admin' && allowedRolesForCoAdmin.includes(activePortalRole)) isAllowed = true;
      if (userRole === 'editor' && allowedRolesForEditor.includes(activePortalRole)) isAllowed = true;
      if (userRole === 'reviewer' && allowedRolesForReviewer.includes(activePortalRole)) isAllowed = true;
      if (userRole === activePortalRole) isAllowed = true;

      if (isAllowed) {
        userRole = activePortalRole;
      }
    }
  } catch {
    console.log("Using fallback dashboard data");
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#07070e", overflow: "hidden" }}>
      <Sidebar role={userRole} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Topbar userName={userName} role={userRole} />
        <main
          style={{
            flex: 1,
            overflowX: "hidden",
            overflowY: "auto",
            background: "#07070e",
            padding: "28px 32px",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
