import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Clock, CheckCircle, AlertCircle, FileSignature } from "lucide-react";
import ReviewActionForm from "@/components/dashboard/ReviewActionForm";
import { cookies } from "next/headers";

export default async function ReviewerDashboard() {
  const { getCurrentUser } = await import('@/app/actions/auth');
  const user: any = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }
  const userId = user.id;

  // Fetch review assignments (Primary SSOT: Supabase)
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
      .order("assigned_at", { ascending: false });

    if (dataById && dataById.length > 0) {
      assignments = [...dataById];
    }

    // Query 2: by reviewer_email
    if (userEmail) {
      const { data: dataByEmail } = await supabaseAdmin
        .from("review_assignments")
        .select("*, submissions(*, journals(name))")
        .eq("reviewer_email", userEmail)
        .order("assigned_at", { ascending: false });

      if (dataByEmail && dataByEmail.length > 0) {
        const existingIds = new Set(assignments.map((a: any) => a.id));
        dataByEmail.forEach((a: any) => {
          if (!existingIds.has(a.id)) assignments.push(a);
        });
      }
    }

    // Safe Fallback: Query Firestore ONLY if Supabase returned 0 assignments
    if (assignments.length === 0) {
      try {
        const { getFirestore } = await import('@/utils/firebase/db');
        const db = getFirestore();
        
        const snap = await db.collection('review_assignments').get();

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
    }

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
  } catch (error: any) {
    console.warn("Supabase fetch review assignments warning:", error?.message || error);
  }

  // Pure Supabase SSOT Read (No Firestore read lag)

  const pendingAssignments = assignments.filter(a => a.status === 'pending');
  const inProgress = assignments.filter(a => a.status === 'accepted');
  const completed = assignments.filter(a => a.status === 'completed');
  const overdue = assignments.filter(a => a.status === 'accepted' && new Date(a.deadline) < new Date());

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Reviewer</h1>
          <p className="text-zinc-400 mt-2 text-sm">Selamat datang kembali, tinjau tugas dan aktivitas reviu Anda.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800/80 p-6 rounded-xl hover:border-amber-500/30 transition-colors relative group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Tugas Menunggu</h3>
            <div className="p-2 bg-zinc-800/50 rounded-lg group-hover:bg-amber-500/10 transition-colors">
              <FileSignature className="w-4 h-4 text-zinc-400 group-hover:text-amber-500 transition-colors" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white group-hover:text-amber-400 transition-colors">{pendingAssignments.length + inProgress.length}</div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/80 p-6 rounded-xl hover:border-emerald-500/30 transition-colors relative group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Ulasan Selesai</h3>
            <div className="p-2 bg-zinc-800/50 rounded-lg group-hover:bg-emerald-500/10 transition-colors">
              <CheckCircle className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">{completed.length}</div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/80 p-6 rounded-xl hover:border-red-500/30 transition-colors relative group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Terlewat Batas Waktu</h3>
            <div className="p-2 bg-zinc-800/50 rounded-lg group-hover:bg-red-500/10 transition-colors">
              <Clock className="w-4 h-4 text-zinc-400 group-hover:text-red-500 transition-colors" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white group-hover:text-red-400 transition-colors">{overdue.length}</div>
        </div>
      </div>

      {/* Main Content Area (Full Width) */}
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex space-x-6 border-b border-zinc-800">
          <div className="pb-4 border-b-2 border-emerald-500 text-emerald-500 font-medium text-sm">Daftar Antrean Aktif</div>
          <div className="pb-4 text-zinc-500 font-medium text-sm hover:text-zinc-300 cursor-pointer">Riwayat Aktivitas</div>
          <div className="pb-4 text-zinc-500 font-medium text-sm hover:text-zinc-300 cursor-pointer">Honorarium Saya</div>
        </div>

        {/* Pending Invitations & Assignments */}
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="p-8 border border-zinc-800/80 rounded-xl bg-zinc-900/30 text-center">
              <p className="text-zinc-400">Belum ada tugas review untuk Anda.</p>
            </div>
          ) : (
            assignments.map((assignment: any) => (
              <div key={assignment.id} className="p-6 border border-zinc-800/80 rounded-xl bg-zinc-900/50 relative overflow-hidden group hover:border-[#c9a84c]/30 transition-colors">
                {assignment.status === 'pending' && <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>}
                {assignment.status === 'accepted' && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>}
                {assignment.status === 'completed' && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>}
                
                <div className="flex items-center gap-2 mb-3">
                  {assignment.status === 'pending' && (
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                      <Clock className="w-3 h-3" /> UNDANGAN MENUNGGU
                    </span>
                  )}
                  {assignment.status === 'accepted' && (
                    <span className="flex items-center gap-1 text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">
                      <FileText className="w-3 h-3" /> DALAM PROSES REVIEW
                    </span>
                  )}
                  {assignment.status === 'completed' && (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                      <CheckCircle className="w-3 h-3" /> REVIEW SELESAI
                    </span>
                  )}
                  <span className="text-xs font-medium text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md">
                    {assignment.submissions?.journals?.name || "JURNAL"}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-[#c9a84c] transition-colors">
                  {assignment.submissions?.title || "Judul Naskah Tidak Ditemukan"}
                </h3>
                
                {/* Abstract preview */}
                {assignment.submissions?.abstract && (
                  <div className="mb-4">
                    <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">
                      {assignment.submissions.abstract}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-zinc-400 mb-6 border-t border-zinc-800 pt-4">
                  <div>Ditugaskan: <span className="text-zinc-300 font-medium">{new Date(assignment.assigned_at).toLocaleDateString('id-ID')}</span></div>
                  {assignment.deadline && (
                    <div>Batas Waktu: <span className="text-red-400 font-medium">{new Date(assignment.deadline).toLocaleDateString('id-ID')}</span></div>
                  )}
                </div>

                {assignment.status === 'pending' && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-2">
                    <h4 className="flex items-center gap-2 text-amber-500 font-semibold text-sm mb-1">
                      <AlertCircle className="w-4 h-4" /> Pernyataan Etika & Konfidensialitas:
                    </h4>
                    <p className="text-xs text-amber-500/80 leading-relaxed">
                      Sebelum dapat mengakses naskah lengkap dan memberikan ulasan, Anda berkewajiban mengonfirmasi kesediaan. Dengan mengklik "Terima Ulasan", Anda menyatakan bersedia mengulas secara profesional dan bebas dari benturan kepentingan dengan penulis.
                    </p>
                  </div>
                )}

                <ReviewActionForm assignment={assignment} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
