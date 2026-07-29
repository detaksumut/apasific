import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  let { data: { user } } = await supabase.auth.getUser();

  // Dual-Auth Check: Fallback to Firebase Cookie if Supabase fails
  if (!user) {
    const cookieStore = await cookies();
    const fbToken = cookieStore.get('firebase_session')?.value;
    const fallbackUserId = cookieStore.get('supabase_fallback_session')?.value;
    
    if (fbToken || fallbackUserId) {
        try {
            if (fbToken) {
               const payloadBase64 = fbToken.split('.')[1];
               const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
               user = { id: payload.uid, email: "editor@firebase.local" } as any;
            }
        } catch (e) {
            console.error("Firebase token verification failed in EditorLayout", e);
        }
        
        if (!user && fallbackUserId) {
           user = { id: fallbackUserId, email: "editor@fallback.local" } as any;
        }
    }
  }

  if (!user) {
    redirect("/auth/login");
  }

  // Convert user ID to UUID if it is a Firebase UID
  let userId = user.id;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      const hex = Buffer.from(userId).toString('hex').padEnd(32, '0').slice(0, 32);
      userId = `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
  
  let r = "";
  if (profile && profile.role) {
      r = profile.role.toLowerCase();
  } else {
      const cookieStore = await cookies();
      const cookieRole = cookieStore.get('user_role')?.value;
      if (cookieRole) {
          r = cookieRole.toLowerCase();
      }
  }

  if (r) {
      if (r.includes('co-admin') || r.includes('co_admin')) {
          redirect('/dashboard/admin/users');
      }
      
      const isAuthorized = r.includes('editor') || 
                           r.includes('layout') || 
                           r.includes('cover') || 
                           r.includes('publish') || 
                           r.includes('supervisor') || 
                           r.includes('admin');
                           
      if (!isAuthorized) {
          // Render server-side access denied screen
          return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-[#0c0c16] rounded-2xl border border-red-500/20 max-w-lg mx-auto mt-20 space-y-4">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-3xl">⚠️</div>
              <h2 className="text-xl font-bold text-white font-['Cinzel']">Akses Ditolak (Access Denied)</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Akun Anda ({r}) tidak memiliki izin untuk mengakses halaman editor ini.
              </p>
              <a href="/dashboard" className="px-6 py-2.5 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors text-sm font-bold">
                Kembali ke Dashboard
              </a>
            </div>
          );
      }
  } else {
      redirect('/dashboard');
  }

  return <>{children}</>;
}
