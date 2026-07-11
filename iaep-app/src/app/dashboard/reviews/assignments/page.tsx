import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Clock, AlertCircle } from "lucide-react";

import { cookies } from "next/headers";

export default async function AssignmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  const mockUserCookie = cookieStore.get("mock_user");

  if (!user && !mockUserCookie) {
    redirect("/auth/login");
  }
  const userId = user?.id || "demo-user-id";

  let assignments: any[] = [];
  try {
    const { data } = await supabase
      .from("review_assignments")
      .select("*, submissions(*, journals(name))")
      .eq("reviewer_id", user.id)
      .eq("status", "pending")
      .order("assigned_at", { ascending: false });
    if (data) assignments = data;
  } catch (error) {
    console.error("Error fetching assignments:", error);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Artikel Ditugaskan</h1>
        <p className="text-zinc-400 mt-2 text-sm">Daftar artikel yang ditugaskan kepada Anda untuk di-review.</p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden min-h-[300px]">
        {assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500">
            <AlertCircle className="w-12 h-12 mb-4 text-zinc-700" />
            <p>Belum ada tugas review artikel baru.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {assignments.map(assignment => (
              <div key={assignment.id} className="p-6 hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3" /> UNDANGAN BARU
                  </span>
                  <span className="text-xs font-medium text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md">
                    {assignment.submissions?.journals?.name || "JURNAL"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{assignment.submissions?.title}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-zinc-400 mb-4">
                  <div>Ditugaskan: <span className="text-zinc-300">{new Date(assignment.assigned_at).toLocaleDateString('id-ID')}</span></div>
                  {assignment.deadline && (
                    <div>Batas Waktu: <span className="text-red-400 font-medium">{new Date(assignment.deadline).toLocaleDateString('id-ID')}</span></div>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <button className="px-4 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-lg font-medium text-sm transition-colors">Tolak</button>
                  <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-emerald-900/20">Terima Ulasan</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
