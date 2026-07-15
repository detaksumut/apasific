import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Clock, CheckCircle, AlertCircle, FileSignature } from "lucide-react";
import ReviewActionForm from "@/components/dashboard/ReviewActionForm";
import { cookies } from "next/headers";

export default async function ReviewerDashboard() {
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
               user = { id: payload.uid, email: "reviewer@firebase.local" } as any;
            }
        } catch (e) {
            console.error("Firebase token verification failed in Reviewer Dashboard", e);
        }
        
        if (!user && fallbackUserId) {
           user = { id: fallbackUserId, email: "reviewer@fallback.local" } as any;
        }
    }
  }

  if (!user) {
    redirect("/auth/login");
  }
  const userId = user.id;

  // Attempt to fetch review assignments if the table exists
  let assignments: any[] = [];
  try {
    const { data, error } = await supabase
      .from("review_assignments")
      .select("*, submissions(*, journals(name))")
      .eq("reviewer_id", userId)
      .order("assigned_at", { ascending: false });
    if (error) throw error;
    if (data) assignments = data;
  } catch (error) {
    console.warn("Supabase fetch review assignments failed, falling back to Firestore");
    try {
        const { getFirestore } = await import('@/utils/firebase/db');
        const db = getFirestore();
        
        const assignmentsSnapshot = await db.collection('review_assignments')
          .where('reviewer_id', '==', userId)
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
            <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Pending Review</h3>
            <div className="p-2 bg-zinc-800/50 rounded-lg group-hover:bg-amber-500/10 transition-colors">
              <FileSignature className="w-4 h-4 text-zinc-400 group-hover:text-amber-500 transition-colors" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white group-hover:text-amber-400 transition-colors">{pendingAssignments.length + inProgress.length}</div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/80 p-6 rounded-xl hover:border-emerald-500/30 transition-colors relative group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Review Selesai</h3>
            <div className="p-2 bg-zinc-800/50 rounded-lg group-hover:bg-emerald-500/10 transition-colors">
              <CheckCircle className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">{completed.length}</div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/80 p-6 rounded-xl hover:border-red-500/30 transition-colors relative group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Overdue</h3>
            <div className="p-2 bg-zinc-800/50 rounded-lg group-hover:bg-red-500/10 transition-colors">
              <Clock className="w-4 h-4 text-zinc-400 group-hover:text-red-500 transition-colors" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white group-hover:text-red-400 transition-colors">{overdue.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex space-x-6 border-b border-zinc-800">
            <div className="pb-4 border-b-2 border-emerald-500 text-emerald-500 font-medium text-sm">RINGKASAN (ANTREAN AKTIF)</div>
            <div className="pb-4 text-zinc-500 font-medium text-sm hover:text-zinc-300 cursor-pointer">AKTIVITAS (ARSIP RIWAYAT)</div>
            <div className="pb-4 text-zinc-500 font-medium text-sm hover:text-zinc-300 cursor-pointer">HONORARIUM SAYA</div>
          </div>

          {/* Pending Invitations */}
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

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="p-6 border border-zinc-800/80 rounded-xl bg-zinc-900/50">
            <h3 className="text-white font-bold mb-3">Panduan Reviewer</h3>
            <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
              Unduh dokumen petunjuk teknis peninjauan artikel untuk memahami standar orisinalitas, validitas metodologi, serta format pelaporan ulasan.
            </p>
            <button className="w-full py-2.5 border border-zinc-700 hover:border-emerald-500 hover:text-emerald-500 text-zinc-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Unduh Panduan Ulasan (PDF)
            </button>
          </div>

          <div className="p-6 border border-zinc-800/80 rounded-xl bg-zinc-900/50">
            <h3 className="text-white font-bold mb-4">Kebijakan Review Jurnal</h3>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li className="flex items-start gap-3">
                <span className="text-xl">🕵️</span>
                <div>
                  <strong className="text-zinc-300 block mb-1">Double-Blind Peer Review:</strong>
                  Identitas reviewer dan penulis disembunyikan secara timbal balik untuk menjaga objektivitas ulasan ilmiah.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl">🔒</span>
                <div>
                  <strong className="text-zinc-300 block mb-1">Kerahasiaan (Confidentiality):</strong>
                  Seluruh naskah adalah dokumen rahasia. Dilarang mendistribusikan, membagikan, atau menggunakan ide naskah sebelum terbit resmi.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
