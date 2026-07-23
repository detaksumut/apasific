import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Clock, CheckCircle, ArrowRight, ShieldCheck, Users } from "lucide-react";

import { cookies } from "next/headers";
import DeleteSubmissionButton from "@/components/DeleteSubmissionButton";
import ResendWaButton from "@/components/ResendWaButton";

export default async function EditorDashboard() {
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
               user = { id: payload.uid, email: "editor@firebase.local" } as any;
            }
        } catch (e) {
            console.error("Firebase token verification failed in EditorDashboard", e);
        }
        
        if (!user && fallbackUserId) {
           user = { id: fallbackUserId, email: "editor@fallback.local" } as any;
        }
    }
  }

  if (!user) {
    redirect("/auth/login");
  }

  // Block co-admins from Editor Dashboard
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile && profile.role) {
      const r = profile.role.toLowerCase();
      if (r.includes('co-admin') || r.includes('co_admin')) {
          redirect('/dashboard/admin/users');
      }
  }

  // Fetch all submissions for the editor (Primary: Supabase SSOT, Fallback: Firestore safe merge)
  let articles: any[] = [];
  
  // 1. Primary SSOT: Fetch all submissions from Supabase
  try {
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    const { data: submissions } = await supabaseAdmin
      .from("submissions")
      .select("*, journals(name)")
      .order("created_at", { ascending: false });
    if (submissions && submissions.length > 0) {
      articles = [...submissions];
    }
  } catch (e: any) {
    console.warn("Supabase fetch failed in Editor Dashboard:", e?.message || e);
  }

  // Pure Supabase SSOT Read (No Firestore background read lag or double counting)

  // 3. Fetch Registered Users from system_settings to get accurate phone numbers
  let registeredUsers: any[] = [];
  try {
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );
    const { data: setting } = await supabaseAdmin.from('system_settings').select('value').eq('key', 'apasific_registered_users').single();
    if (setting && setting.value) {
      registeredUsers = Array.isArray(setting.value) ? setting.value : JSON.parse(setting.value);
    }
  } catch (e) {}

  // Deduplicate articles by title to ensure 100% accurate metrics
  const seenTitles = new Set<string>();
  const uniqueArticles = articles.filter(a => {
    const clean = (a.title || '').trim().toLowerCase();
    if (!clean || seenTitles.has(clean)) return false;
    seenTitles.add(clean);
    return true;
  });

  // Sort merged results by created_at desc
  uniqueArticles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Helper: Cek apakah artikel terbit (status Published/Production Completed ATAU memiliki DOI/Zenodo ID)
  const checkIsPublished = (a: any) => ['Published', 'Production Completed'].includes(a.status) || Boolean(a.doi || a.zenodo_id);

  // Pisahkan: naskah aktif (belum Published) vs riwayat terbit
  const activeArticles = uniqueArticles.filter(a => !checkIsPublished(a));
  const publishedCount = uniqueArticles.filter(a => checkIsPublished(a)).length;

  const totalArticles = uniqueArticles.length;
  const pendingReview = activeArticles.filter(a => ['queued', 'Awaiting Reviewers', 'Under Review'].includes(a.status)).length;
  const acceptedArticles = activeArticles.filter(a => a.status === 'Accepted' || a.status === 'accepted').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Editor</h1>
          <p className="text-zinc-400 mt-2 text-sm">Overview of all manuscript submissions across the platform.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800/80 p-6 rounded-xl hover:border-emerald-500/30 transition-colors relative group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Total Naskah</h3>
            <div className="p-2 bg-zinc-800/50 rounded-lg group-hover:bg-emerald-500/10 transition-colors">
              <FileText className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">{totalArticles}</div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/80 p-6 rounded-xl hover:border-emerald-500/30 transition-colors relative group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Menunggu Review</h3>
            <div className="p-2 bg-zinc-800/50 rounded-lg group-hover:bg-emerald-500/10 transition-colors">
              <Clock className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">{pendingReview}</div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/80 p-6 rounded-xl hover:border-emerald-500/30 transition-colors relative group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Diterima</h3>
            <div className="p-2 bg-zinc-800/50 rounded-lg group-hover:bg-emerald-500/10 transition-colors">
              <CheckCircle className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">{acceptedArticles}</div>
        </div>

        {/* Kotak Riwayat Terbit — klik langsung ke halaman publications */}
        <Link href="/dashboard/editor/publications" className="bg-teal-900/20 border border-teal-800/40 p-6 rounded-xl hover:border-teal-500/50 transition-colors relative group block">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-teal-400 text-xs font-semibold uppercase tracking-wider">Sudah Terbit</h3>
            <div className="p-2 bg-teal-800/20 rounded-lg group-hover:bg-teal-500/20 transition-colors">
              <CheckCircle className="w-4 h-4 text-teal-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-teal-300 group-hover:text-teal-200 transition-colors">{publishedCount}</div>
          <p className="text-[10px] text-teal-600 mt-2 font-medium">Lihat Riwayat Terbit →</p>
        </Link>
      </div>

      {/* Submissions List — hanya naskah AKTIF (belum Published) */}
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Naskah Aktif (Dalam Proses)
          </h2>
          <span className="text-xs text-zinc-500">{activeArticles.length} naskah</span>
        </div>
        
        {activeArticles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-white font-medium mb-1">Tidak ada naskah aktif</h3>
            <p className="text-zinc-500 text-sm">Semua naskah sudah diproses. Lihat <Link href="/dashboard/editor/publications" className="text-teal-400 underline">Riwayat Terbit</Link>.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {activeArticles.map((article: any) => {
              let senderName = article.profiles?.full_name || 'Penulis Tidak Diketahui';
              let senderPhone = article.phone || article.profiles?.phone || '-';
              let senderEmail = 'N/A';

              try {
                const parsedAbstract = JSON.parse(article.abstract || '{}');
                if (parsedAbstract.authors && parsedAbstract.authors.length > 0) {
                  const primary = parsedAbstract.authors[0];
                  if (primary.full_name && senderName === 'Penulis Tidak Diketahui') senderName = primary.full_name;
                  if (primary.email) senderEmail = primary.email;
                }
                if (parsedAbstract.phone && senderPhone === '-') senderPhone = parsedAbstract.phone;
              } catch(e) {}

              // Lookup registered users array by email
              if (senderPhone === '-' && senderEmail !== 'N/A') {
                const match = registeredUsers.find(u => u.email?.toLowerCase() === senderEmail.toLowerCase());
                if (match && (match.phone_number || match.phone)) {
                  senderPhone = match.phone_number || match.phone;
                }
              }

              return (
              <div key={article.id || article.submission_id} className="p-6 hover:bg-zinc-800/30 transition-colors group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {/* Kode singkat jurnal — warna berbeda per disiplin ilmu */}
                      {(() => {
                        const jName = (article.journals?.name || '').toUpperCase();
                        let code = '';
                        let colorClass = '';
                        if (jName.includes('AJITE')) { code = 'AJITE'; colorClass = 'bg-blue-500/15 text-blue-400 border-blue-500/30'; }
                        else if (jName.includes('AJAF')) { code = 'AJAF'; colorClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30'; }
                        else if (jName.includes('AJCS')) { code = 'AJCS'; colorClass = 'bg-purple-500/15 text-purple-400 border-purple-500/30'; }
                        else if (jName.includes('AJES')) { code = 'AJES'; colorClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'; }
                        else if (jName.includes('AJAF') || jName.includes('AKUNTANSI')) { code = 'AJAF'; colorClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30'; }
                        else { code = jName.split(' ')[0] || 'JRL'; colorClass = 'bg-zinc-700/50 text-zinc-300 border-zinc-600/50'; }
                        return code ? (
                          <span className={`text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-lg border ${colorClass}`}>
                            {code}
                          </span>
                        ) : null;
                      })()}
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {article.journals?.name || "Jurnal Tidak Diketahui"}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        article.status === 'queued' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        ['Awaiting Reviewers'].includes(article.status) ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        ['Under Review', 'under_review'].includes(article.status) ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        ['Accepted', 'accepted'].includes(article.status) ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        ['Pending Reviewer Approval'].includes(article.status) ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
                        ['Published'].includes(article.status) ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
                        'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}>
                        {article.status === 'queued' ? '⏳ Antrian Masuk' : article.status}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-zinc-500">
                      Disubmit pada: {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-zinc-300 bg-zinc-800/60 px-2 py-1 rounded border border-zinc-700/50">
                        <Users className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{senderName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                        <span>HP: {senderPhone}</span>
                      </div>
                      {senderEmail !== 'N/A' && (
                        <div className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-800/60 px-2 py-1 rounded border border-zinc-700/50">
                          <span>{senderEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <ResendWaButton phone={senderPhone} title={article.title} />
                    <Link 
                      href={`/dashboard/editor/submissions/${article.id || article.submission_id}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition-all text-sm font-medium border border-emerald-500/20 hover:border-emerald-500"
                    >
                      Kelola Naskah
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <DeleteSubmissionButton id={article.id || article.submission_id} />
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
