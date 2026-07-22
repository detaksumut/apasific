import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CheckCircle, Eye } from "lucide-react";
import Link from "next/link";

import { cookies } from "next/headers";

export default async function ReviewHistoryPage() {
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
      .eq("status", "completed")
      .order("completed_at", { ascending: false });
    if (error) throw error;
    if (data) {
      // Filter out orphaned assignments where submissions is null (deleted submission)
      assignments = data.filter(a => a.submissions != null);
    }
  } catch (error) {
    console.warn("Supabase fetch history failed, falling back to Firestore");
    try {
        const { getFirestore } = await import('@/utils/firebase/db');
        const db = getFirestore();
        
        const reviewerIdToUse = user.json_id || userId;
        const assignmentsSnapshot = await db.collection('review_assignments')
          .where('reviewer_id', '==', reviewerIdToUse)
          .where('status', '==', 'completed')
          .get();
          
        for (const doc of assignmentsSnapshot.docs) {
            const data = doc.data();
            const assignment: any = {
                id: doc.id,
                ...data,
                completed_at: data.completed_at ? data.completed_at.toDate() : new Date(),
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
        
        assignments.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
    } catch (fbErr) {
        console.error("Firestore fallback failed", fbErr);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Riwayat Review</h1>
        <p className="text-zinc-400 mt-2 text-sm">Daftar riwayat review artikel yang telah selesai Anda kerjakan.</p>
        
        {/* TEMPORARY RESTORE BUTTON ON REVIEWER DASHBOARD */}
        <form action={async () => {
          "use server";
          const { createClient } = await import('@supabase/supabase-js');
          const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
          const TARGET_TITLE = "THE IMPACT OF SUPPLY CHAIN TRANSPARENCY (LOGISTICS GOVERNANCE) ON THE EASE OF OBTAINING HALAL CERTIFICATION FOR FOOD AND BEVERAGE MSMEs";
          let subId = null;

          try {
              // 1. Check Supabase
              const { data: subs } = await supabaseAdmin.from('submissions').select('id').ilike('title', '%SUPPLY CHAIN TRANSPARENCY%');
              if (subs && subs.length > 0) {
                  subId = subs[0].id;
                  await supabaseAdmin.from('submissions').update({ stage: 'Review', status: 'Under Review' }).eq('id', subId);
              } else {
                  const { data: inserted } = await supabaseAdmin.from('submissions').insert({ title: TARGET_TITLE, stage: 'Review', status: 'Under Review', author: 'Author', abstract: 'Restored article' }).select('id').single();
                  if (inserted) subId = inserted.id;
              }
              
              if (subId) {
                  const { data: existingRev } = await supabaseAdmin.from('review_assignments').select('id').eq('submission_id', subId).eq('reviewer_id', userId);
                  if (existingRev && existingRev.length > 0) {
                     await supabaseAdmin.from('review_assignments').update({ status: 'accepted', completed_at: null }).eq('id', existingRev[0].id);
                  } else {
                     await supabaseAdmin.from('review_assignments').insert({ submission_id: subId, reviewer_id: userId, status: 'accepted' });
                  }
              }

              // 2. Check Firestore
              const { getFirestore } = await import('@/utils/firebase/db');
              const db = getFirestore();
              const snap = await db.collection('submissions').get();
              let fbSubId = null;
              snap.forEach(doc => {
                  const t = doc.data().title || "";
                  if (t.toUpperCase().includes("SUPPLY CHAIN TRANSPARENCY")) fbSubId = doc.id;
              });
              
              if (!fbSubId && subId) {
                  fbSubId = subId;
                  await db.collection('submissions').doc(fbSubId).set({ title: TARGET_TITLE, stage: 'Review', status: 'Under Review', author: 'Author', abstract: 'Restored article', created_at: new Date(), updated_at: new Date() });
              }
              
              if (fbSubId) {
                  await db.collection('submissions').doc(fbSubId).update({ stage: 'Review', status: 'Under Review' });
                  const reviewerIdToUse = user.json_id || userId;
                  const revSnap = await db.collection('review_assignments').where('submission_id', '==', fbSubId).where('reviewer_id', '==', reviewerIdToUse).get();
                  if (revSnap.empty) {
                      await db.collection('review_assignments').doc().set({
                          submission_id: fbSubId,
                          reviewer_id: reviewerIdToUse,
                          status: 'accepted',
                          assigned_at: new Date()
                      });
                  } else {
                      revSnap.forEach(async doc => {
                          await db.collection('review_assignments').doc(doc.id).update({ status: 'accepted', completed_at: null });
                      });
                  }
              }
          } catch(e) { console.error(e); }
        }}>
          <button type="submit" className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-sm border border-amber-500 shadow-lg shadow-amber-900/20">
            [PENGATURAN DARURAT] Tarik Artikel Supply Chain ke Antrean Saya
          </button>
        </form>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden min-h-[300px]">
        {assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500">
            <p>Belum ada riwayat review yang selesai.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {assignments.map(assignment => (
              <div key={assignment.id} className="p-6 hover:bg-zinc-800/30 transition-colors flex flex-col md:flex-row gap-6 md:items-center justify-between group">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <CheckCircle className="w-3 h-3" /> Selesai
                    </span>
                    <span className="text-xs font-medium text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md border border-zinc-700">
                      {assignment.submissions?.journals?.name || "JURNAL"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {assignment.submissions?.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                    <div>Disubmit: <span className="text-zinc-400">{assignment.completed_at ? new Date(assignment.completed_at).toLocaleDateString('id-ID') : '-'}</span></div>
                    <div>Rekomendasi Anda: <span className={`font-medium ${
                      assignment.recommendation === 'Accept Submission' ? 'text-emerald-400' : 
                      assignment.recommendation === 'Revisions Required' ? 'text-amber-400' : 
                      'text-red-400'
                    }`}>{assignment.recommendation || 'Tidak ada rekomendasi'}</span></div>
                  </div>
                </div>
                <div className="shrink-0">
                  <Link 
                    href={`/dashboard/reviews/${assignment.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-zinc-700 text-zinc-300 hover:text-white hover:border-emerald-500 rounded-lg text-sm font-medium transition-colors bg-zinc-800/50 hover:bg-emerald-500/10"
                  >
                    <Eye className="w-4 h-4" />
                    Lihat Hasil Review
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
