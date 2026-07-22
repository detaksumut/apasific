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
    const { data, error } = await supabase
      .from("review_assignments")
      .select("*, submissions(*, journals(name))")
      .eq("reviewer_id", userId)
      .in("status", ["accepted", "pending"])  // hanya yang masih aktif, BUKAN completed
      .order("assigned_at", { ascending: false });
    if (error) throw error;
    if (data) {
      // Filter out orphaned assignments where submissions is null (deleted submission)
      assignments = data.filter(a => a.submissions != null);
    }
  } catch (error) {
    console.warn("Supabase fetch my reviews failed, falling back to Firestore");
    try {
        const { getFirestore } = await import('@/utils/firebase/db');
        const db = getFirestore();
        
        const reviewerIdToUse = user.json_id || userId;
        const assignmentsSnapshot = await db.collection('review_assignments')
          .where('reviewer_id', '==', reviewerIdToUse)
          .where('status', 'in', ['accepted', 'pending'])  // hanya aktif
          .get();
          
        for (const doc of assignmentsSnapshot.docs) {
            const data = doc.data();
            const assignment: any = {
                id: doc.id,
                ...data,
                assigned_at: data.created_at ? data.created_at.toDate() : new Date(),
                deadline: data.deadline ? data.deadline.toDate() : null
            };
            
            // fetch submission
            if (data.submission_id) {
               const subDoc = await db.collection('submissions').doc(data.submission_id).get();
               if (subDoc.exists) {
                   const subData = subDoc.data()!;
                   assignment.submissions = {
                       id: subDoc.id,
                       title: subData.title,
                       abstract: subData.abstract,
                       status: subData.status,
                       journals: subData.journals || { name: 'Jurnal' }
                   };
                   assignments.push(assignment);
               }
            }
        }
        
        assignments.sort((a, b) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime());
    } catch (fbErr) {
        console.error("Firestore fallback failed", fbErr);
    }
  }

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
