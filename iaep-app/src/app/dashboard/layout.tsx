import { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  let userRole = "author";
  let userName = "Dr. John Doe";

  try {
    const cookieStore = await cookies();
    const mockUser = cookieStore.get('mock_user')?.value;

    if (mockUser === 'admin') {
      userRole = 'admin';
      userName = 'Super Admin';
    } else if (mockUser === 'editor') {
      userRole = 'editor';
      userName = cookieStore.get('mock_user_name')?.value || 'M. A. Rahman';
    } else if (mockUser === 'reviewer') {
      userRole = 'reviewer';
      userName = cookieStore.get('mock_user_name')?.value || 'Kadin Medan';
    } else if (mockUser === 'submitter') {
      userRole = 'author';
      userName = cookieStore.get('mock_user_name')?.value || 'Kad Sumut';
    } else {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single();
        if (profile) {
          userRole = profile.role || "member";
          userName = profile.full_name || user.email || "User";
        }
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
