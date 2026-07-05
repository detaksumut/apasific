import Link from "next/link";
import { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Try to fetch real user from Supabase
  let userRole = "author";
  let userName = "Dr. John Doe";

  try {
    // 1. Coba baca dari cookie mock UI dulu
    const cookieStore = await cookies();
    const mockUser = cookieStore.get('mock_user')?.value;
    
    if (mockUser === 'admin') {
      userRole = 'admin';
      userName = 'Super Admin';
    } else if (mockUser === 'editor') {
      userRole = 'editor';
      userName = cookieStore.get('mock_user_name')?.value || 'M. A. Rahman (Editor)';
    } else if (mockUser === 'reviewer') {
      userRole = 'reviewer';
      userName = cookieStore.get('mock_user_name')?.value || 'Kadin Medan (Reviewer)';
    } else if (mockUser === 'submitter') {
      userRole = 'author';
      userName = cookieStore.get('mock_user_name')?.value || 'Kad Sumut (Author)';
    } else {
      // 2. Jika tidak ada cookie, baru coba Supabase
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
  } catch (error) {
    // Fallback to dummy data if keys are invalid
    console.log("Using fallback dashboard data");
  }

  return (
    <div className="flex h-screen bg-[#f4f7f6]">
      {/* Sidebar - Dark Premium Theme */}
      <Sidebar role={userRole} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar userName={userName} role={userRole} />

        {/* Page Content - Light/Clean Theme for reading manuscripts */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f4f7f6]" style={{ padding: '24px' }}>
          <div className="w-full max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} // trigger CSS rebuild
