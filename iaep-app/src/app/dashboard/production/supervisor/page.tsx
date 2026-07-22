import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeleteSubmissionButton from "@/components/DeleteSubmissionButton";
import { ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { cookies } from "next/headers";

export default async function SupervisorDashboard() {
  const supabase = await createClient();
  let { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const cookieStore = await cookies();
    const fbToken = cookieStore.get('firebase_session')?.value;
    const fallbackUserId = cookieStore.get('supabase_fallback_session')?.value;
    
    if (fbToken || fallbackUserId) {
        try {
            if (fbToken) {
               const payloadBase64 = fbToken.split('.')[1];
               const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
               user = { id: payload.uid, email: "user@firebase.local" } as any;
            }
        } catch (e) {
            console.error("Firebase token verification failed");
        }
        
        if (!user && fallbackUserId) {
           user = { id: fallbackUserId, email: "user@fallback.local" } as any;
        }
    }
  }
  if (!user) redirect("/auth/login");

  let pendingArticles: any[] = [];
  let completedArticles: any[] = [];

  // Fetch from Supabase
  try {
    const { data: submissions } = await supabase
      .from("submissions")
      .select("*, journals(name), profiles:author_id(full_name)")
      .eq("stage", "Production")
      .in("status", ["Pending Supervisor", "Production Completed"])
      .order("created_at", { ascending: false });
    
    if (submissions && submissions.length > 0) {
      pendingArticles = submissions.filter(a => a.status === "Pending Supervisor");
      completedArticles = submissions.filter(a => a.status === "Production Completed");
    }
  } catch (e) {
    console.error("Supabase fetch error", e);
  }

  // Fetch from Firestore and merge
  try {
    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();
    const submissionsSnapshot = await db.collection('submissions').orderBy('created_at', 'desc').get();
    const existingIds = new Set([...pendingArticles, ...completedArticles].map(a => a.id));

    const fbArticles = submissionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
          id: doc.id,
          title: data.title,
          stage: data.stage,
          status: data.status,
          created_at: data.created_at && data.created_at.toDate ? data.created_at.toDate() : new Date(),
          journals: data.journals || { name: 'Unknown Journal' },
          profiles: { full_name: data.author || 'Author' }
      };
    }).filter(article => article.stage === "Production" && !existingIds.has(article.id));

    for (const fb of fbArticles) {
      if (fb.status === "Pending Supervisor") pendingArticles.push(fb);
      else if (fb.status === "Production Completed") completedArticles.push(fb);
    }
  } catch (fbErr) {
    console.error("Firestore fetch failed", fbErr);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Supervisor</h1>
        <p className="text-zinc-400 mt-2 text-sm">Validasi akhir dari seluruh proses produksi sebelum naskah diterbitkan.</p>
        
        {/* TEMPORARY RESET BUTTON */}
        <form action={async () => {
          "use server";
          const { createClient } = await import('@supabase/supabase-js');
          const supabaseAdmin = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );
          
          try {
              // 1. Supabase Reset
              const { data: subs } = await supabaseAdmin.from('submissions')
                  .select('id')
                  .ilike('title', '%SUPPLY CHAIN TRANSPARENCY%');
              
              if (subs && subs.length > 0) {
                  const subId = subs[0].id;
                  await supabaseAdmin.from('submissions').update({ stage: 'Review', status: 'Under Review' }).eq('id', subId);
                  
                  const { data: profs } = await supabaseAdmin.from('profiles').select('id').eq('email', 'kadsumut@gmail.com');
                  if (profs && profs.length > 0) {
                      await supabaseAdmin.from('review_assignments')
                          .update({ status: 'accepted', completed_at: null })
                          .eq('submission_id', subId)
                          .eq('reviewer_id', profs[0].id);
                  }
              }

              // 2. Firestore Reset
              const { getFirestore } = await import('@/utils/firebase/db');
              const db = getFirestore();
              const snap = await db.collection('submissions').get();
              let fbSubId = null;
              snap.forEach(doc => {
                  const t = doc.data().title || "";
                  if (t.toUpperCase().includes("SUPPLY CHAIN TRANSPARENCY")) {
                      fbSubId = doc.id;
                  }
              });
              
              if (fbSubId) {
                  await db.collection('submissions').doc(fbSubId).update({ stage: 'Review', status: 'Under Review' });
                  const revSnap = await db.collection('review_assignments').where('submission_id', '==', fbSubId).get();
                  revSnap.forEach(async doc => {
                      if (doc.data().status === 'completed') {
                          await db.collection('review_assignments').doc(doc.id).update({ status: 'accepted', completed_at: null });
                      }
                  });
              }
          } catch(e) { console.error(e); }
        }}>
          <button type="submit" className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-sm border border-red-500 shadow-lg shadow-red-900/20">
            [DARURAT] Kembalikan Artikel Supply Chain ke Reviewer
          </button>
        </form>
        </div>
      </div>

      {/* Antrean Aktif */}
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Antrean Finalisasi & Pemeriksaan
            {pendingArticles.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs rounded-full font-semibold">{pendingArticles.length} menunggu</span>
            )}
          </h2>
        </div>
        
        {pendingArticles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-white font-medium mb-1">Tidak ada naskah dalam antrean</h3>
            <p className="text-zinc-500 text-sm">Semua naskah telah diverifikasi.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {pendingArticles.map((article: any) => (
              <div key={article.id} className="p-6 hover:bg-zinc-800/30 transition-colors group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {article.journals?.name || "Jurnal"}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Menunggu Verifikasi
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-emerald-500 transition-colors line-clamp-1">
                      {article.title}
                    </h3>
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-2">
                    <Link href={`/dashboard/editor/submissions/${article.id}?tab=production`} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded text-sm flex items-center gap-2 transition-colors">
                      Validasi & Sahkan
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <DeleteSubmissionButton id={article.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Riwayat Selesai */}
      {completedArticles.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              Riwayat — Sudah Dikembalikan ke Editor
              <span className="ml-2 px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs rounded-full font-semibold">{completedArticles.length}</span>
            </h2>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {completedArticles.map((article: any) => (
              <div key={article.id} className="p-6 hover:bg-zinc-800/30 transition-colors group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {article.journals?.name || "Jurnal"}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        ✓ Produksi Selesai
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-400 line-clamp-1">
                      {article.title}
                    </h3>
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-2">
                    <Link href={`/dashboard/editor/submissions/${article.id}?tab=production`} className="bg-zinc-700 hover:bg-zinc-600 text-zinc-300 font-bold py-2 px-4 rounded text-sm flex items-center gap-2 transition-colors">
                      Lihat Detail
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <DeleteSubmissionButton id={article.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
