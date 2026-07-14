import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Eye, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

import { cookies } from "next/headers";

export default async function MyReviewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }
  const userId = user.id;

  let assignments: any[] = [];
  try {
    const { data } = await supabase
      .from("review_assignments")
      .select("*, submissions(*, journals(name))")
      .eq("reviewer_id", userId)
      .in("status", ["accepted", "completed"])
      .order("assigned_at", { ascending: false });
    if (data) assignments = data;
  } catch (error) {
    console.error("Error fetching my reviews:", error);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Review Saya</h1>
        <p className="text-zinc-400 mt-2 text-sm">Daftar review yang telah ditugaskan dan disubmit oleh Anda.</p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden min-h-[300px]">
        {assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500">
            <p>Belum ada naskah yang Anda reviu saat ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {assignments.map(assignment => (
              <div key={assignment.id} className="p-6 hover:bg-zinc-800/30 transition-colors flex flex-col md:flex-row gap-6 md:items-center justify-between group">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${
                      assignment.status === 'completed' 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {assignment.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />} 
                      {assignment.status === 'completed' ? 'Selesai' : 'Sedang Direviu'}
                    </span>
                    <span className="text-xs font-medium text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md border border-zinc-700">
                      {assignment.submissions?.journals?.name || "JURNAL"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {assignment.submissions?.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                    <div>Ditugaskan: <span className="text-zinc-400">{new Date(assignment.assigned_at).toLocaleDateString('id-ID')}</span></div>
                    {assignment.deadline && (
                      <div>Batas Waktu: <span className="text-zinc-400">{new Date(assignment.deadline).toLocaleDateString('id-ID')}</span></div>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  <Link 
                    href={`/dashboard/reviews/${assignment.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-zinc-700 text-zinc-300 hover:text-white hover:border-emerald-500 rounded-lg text-sm font-medium transition-colors bg-zinc-800/50 hover:bg-emerald-500/10"
                  >
                    <Eye className="w-4 h-4" />
                    Lihat / Lanjutkan
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
