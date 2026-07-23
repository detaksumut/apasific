import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Eye, Clock, CheckCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import MyReviewDeleteButton from "@/components/dashboard/MyReviewDeleteButton";

import { cookies } from "next/headers";

export default async function MyReviewsPage() {
  const supabase = await createClient();
  const { getCurrentUser } = await import('@/app/actions/auth');
  const user: any = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }
  const userId = user.id;

  let assignments: any[] = [];
  try {
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    const candidateIds = new Set<string>();
    if (userId) candidateIds.add(userId);
    if ((user as any).json_id) candidateIds.add((user as any).json_id);
    if (user.email && !user.email.includes('fallback@')) {
      candidateIds.add(user.email);
      if (user.email.toLowerCase() === 'kadsumut@gmail.com') {
        candidateIds.add('kadsumut@gmail.com');
        candidateIds.add('user_17840545371');
        candidateIds.add('75736572-5f31-3738-3430-353435333731');
      }
    }

    // Generate hex UUIDs for all non-UUID candidate IDs
    Array.from(candidateIds).forEach(id => {
      if (id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
         const hex = Buffer.from(id).toString('hex').padEnd(32, '0').slice(0, 32);
         candidateIds.add(`${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`);
      }
    });

    const idArray = Array.from(candidateIds);
    const userEmail = user.email && !user.email.includes('fallback@') ? user.email.toLowerCase() : null;

    // Query 1: by reviewer_id (Hanya penugasan yang SUDAH DITERIMA/ACCEPTED oleh Reviewer)
    const { data: dataById } = await supabaseAdmin
      .from("review_assignments")
      .select("*, submissions(*, journals(name))")
      .in("reviewer_id", idArray)
      .eq("status", "accepted")
      .order("assigned_at", { ascending: false });

    let allData: any[] = dataById || [];

    // Query 2: by reviewer_email
    if (userEmail) {
      const { data: dataByEmail } = await supabaseAdmin
        .from("review_assignments")
        .select("*, submissions(*, journals(name))")
        .eq("reviewer_email", userEmail)
        .eq("status", "accepted")
        .order("assigned_at", { ascending: false });

      if (dataByEmail && dataByEmail.length > 0) {
        const existingIds = new Set(allData.map((a: any) => a.id));
        dataByEmail.forEach((a: any) => {
          if (!existingIds.has(a.id)) allData.push(a);
        });
      }
    }

    if (allData.length > 0) {
      assignments = await Promise.all(
        allData.map(async (assign: any) => {
          let sub = assign.submissions;
          const targetSubId = assign.submission_id;

          if ((!sub || !sub.title) && targetSubId) {
            try {
              const { data: subData } = await supabaseAdmin
                .from("submissions")
                .select("*, journals(name)")
                .or(`id.eq.${targetSubId},submission_id.eq.${targetSubId}`)
                .maybeSingle();

              if (subData) {
                sub = subData;
              }
            } catch (e) {}
          }

          return {
            ...assign,
            submissions: sub
          };
        })
      );
    }
  } catch (error: any) {
    console.warn("Supabase fetch my reviews warning:", error?.message || error);
  }

  // Pure Supabase SSOT Read (No Firestore read lag)

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Review Saya</h1>
        <p className="text-zinc-400 mt-2 text-sm">Daftar naskah yang <strong className="text-zinc-200">sedang Anda review</strong>. Naskah yang sudah selesai tersimpan di <a href="/dashboard/reviews/history" className="text-emerald-400 underline hover:text-emerald-300">Riwayat Review</a>.</p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden min-h-[300px]">
        {assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500">
            <p>Tidak ada naskah yang sedang Anda review saat ini.</p>
            <a href="/dashboard/reviews/history" className="mt-3 text-xs text-emerald-400 hover:underline">Lihat Riwayat Review →</a>
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
                <div className="shrink-0 flex items-center gap-2">
                  <MyReviewDeleteButton assignmentId={assignment.id} submissionId={assignment.submission_id} />
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
