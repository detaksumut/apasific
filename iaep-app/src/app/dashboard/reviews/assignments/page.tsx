import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserPlus, Search, BookOpen, Clock, AlertCircle } from "lucide-react";
import { cookies } from "next/headers";
import AssignmentActionButtons from "@/components/dashboard/AssignmentActionButtons";

export default async function AssignmentsPage() {
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
      .eq("status", "pending")
      .order("assigned_at", { ascending: false });
    if (error) throw error;
    if (data) assignments = data;
  } catch (error) {
    console.warn("Supabase fetch assignments failed, falling back to Firestore");
    try {
        const { getFirestore } = await import('@/utils/firebase/db');
        const db = getFirestore();
        
        const reviewerIdToUse = user.json_id || userId;
        const assignmentsSnapshot = await db.collection('review_assignments')
          .where('reviewer_id', '==', reviewerIdToUse)
          .where('status', '==', 'pending')
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
               }
            }
            assignments.push(assignment);
        }
        
        assignments.sort((a, b) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime());
    } catch (fbErr) {
        console.error("Firestore fallback failed", fbErr);
    }
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
                
                <AssignmentActionButtons 
                  assignmentId={assignment.id} 
                  submissionId={assignment.submission_id || assignment.submissions?.id} 
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
