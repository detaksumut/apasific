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

    // Query 1: by reviewer_id (UUID variants)
    const idArray = Array.from(candidateIds);
    const userEmail = user.email && !user.email.includes('fallback@') ? user.email.toLowerCase() : null;

    const { data: dataById } = await supabaseAdmin
      .from("review_assignments")
      .select("*, submissions(*, journals(name))")
      .in("reviewer_id", idArray)
      .eq("status", "pending")
      .order("assigned_at", { ascending: false });

    if (dataById && dataById.length > 0) {
      assignments = [...dataById];
    }

    // Query 2: by reviewer_email (lebih reliable, hindari masalah UUID)
    if (userEmail) {
      const { data: dataByEmail } = await supabaseAdmin
        .from("review_assignments")
        .select("*, submissions(*, journals(name))")
        .eq("reviewer_email", userEmail)
        .eq("status", "pending")
        .order("assigned_at", { ascending: false });

      if (dataByEmail && dataByEmail.length > 0) {
        // Merge tanpa duplikat berdasarkan id
        const existingIds = new Set(assignments.map((a: any) => a.id));
        dataByEmail.forEach((a: any) => {
          if (!existingIds.has(a.id)) assignments.push(a);
        });
      }
    }

    // Safe Fallback: Query Firestore if Supabase assignments are missing or to merge legacy assignments
    try {
      const { getFirestore } = await import('@/utils/firebase/db');
      const db = getFirestore();
      
      const snap = await db.collection('review_assignments')
        .where('status', '==', 'pending')
        .get();

      const fbAssignments: any[] = [];
      snap.forEach((doc: any) => {
        const d = doc.data();
        const rId = d.reviewer_id || '';
        const rEmail = d.reviewer_email || '';
        if (candidateIds.has(rId) || candidateIds.has(rEmail) || (user.email && rEmail.toLowerCase() === user.email.toLowerCase())) {
           fbAssignments.push({
             id: doc.id,
             submission_id: d.submission_id,
             reviewer_id: rId,
             status: d.status || 'pending',
             assigned_at: d.assigned_at?.toDate ? d.assigned_at.toDate() : new Date(d.assigned_at || Date.now()),
             deadline: d.deadline?.toDate ? d.deadline.toDate() : d.deadline
           });
        }
      });

      const existingSubIds = new Set(assignments.map(a => a.submission_id));
      fbAssignments.forEach(fbA => {
        if (!existingSubIds.has(fbA.submission_id)) {
           assignments.push(fbA);
        }
      });
    } catch(e) {}

    // Enrich all assignments with submission title & journal info
    if (assignments.length > 0) {
      assignments = await Promise.all(
        assignments.map(async (assign: any) => {
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

            // Firestore submission fallback
            if (!sub || !sub.title) {
              try {
                const { getFirestore } = await import('@/utils/firebase/db');
                const db = getFirestore();
                const subDoc = await db.collection('submissions').doc(targetSubId).get();
                if (subDoc.exists) {
                   const sd = subDoc.data();
                   sub = {
                     id: subDoc.id,
                     title: sd?.title,
                     abstract: sd?.abstract,
                     journals: sd?.journals || { name: 'Jurnal' }
                   };
                }
              } catch(e) {}
            }
          }

          return {
            ...assign,
            submissions: sub
          };
        })
      );
    }
  } catch (error) {
    // ignore
  }

  // Pure Supabase SSOT Read (No Firestore read lag)

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
            {assignments.map(assignment => {
              const subTitle = assignment.submissions?.title || assignment.title || assignment.submission_title || "Judul Naskah";
              const journalName = assignment.submissions?.journals?.name || assignment.journal_name || "JURNAL";

              return (
                <div key={assignment.id} className="p-6 hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                      <Clock className="w-3 h-3" /> UNDANGAN BARU
                    </span>
                    <span className="text-xs font-medium text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md">
                      {journalName}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{subTitle}</h3>
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
