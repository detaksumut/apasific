import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Clock, CheckCircle, ArrowRight, ShieldCheck, Users } from "lucide-react";

import { cookies } from "next/headers";

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

  // Fetch all submissions for the editor (Dual-Database Fallback)
  let articles: any[] = [];
  try {
    const { data: submissions, error } = await supabase
      .from("submissions")
      .select("*, journals(name)")
      .order("created_at", { ascending: false });
      
    if (error) throw error;
    articles = submissions || [];
  } catch (e) {
    console.warn("Supabase fetch failed in Editor Dashboard, falling back to Firestore");
    try {
      const { getFirestore } = await import('@/utils/firebase/db');
      const db = getFirestore();
      const submissionsSnapshot = await db.collection('submissions')
        .orderBy('created_at', 'desc')
        .get();
        
      articles = submissionsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
              submission_id: doc.id,
              id: doc.id,
              title: data.title,
              status: data.status,
              created_at: data.created_at ? data.created_at.toDate() : new Date(),
              journals: data.journals || { name: 'Unknown Journal' }
          };
      });
    } catch (fbErr) {
      console.error("Firestore fallback failed", fbErr);
    }
  }
  
  const totalArticles = articles.length;
  const pendingReview = articles.filter(a => ['queued', 'Awaiting Reviewers', 'Under Review'].includes(a.status)).length;
  const acceptedArticles = articles.filter(a => a.status === 'Accepted' || a.status === 'accepted').length;

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>

      {/* Submissions List */}
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Semua Naskah Masuk
          </h2>
        </div>
        
        {articles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-white font-medium mb-1">Belum ada naskah</h3>
            <p className="text-zinc-500 text-sm">Belum ada *author* yang mengirimkan naskah.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {articles.map((article: any) => (
              <div key={article.id || article.submission_id} className="p-6 hover:bg-zinc-800/30 transition-colors group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {article.journals?.name || "Jurnal Tidak Diketahui"}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        ['Awaiting Reviewers', 'queued'].includes(article.status) ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        ['Under Review', 'under_review'].includes(article.status) ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        ['Accepted', 'accepted'].includes(article.status) ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}>
                        {article.status}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-zinc-500">
                      Disubmit pada: {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  
                  <Link 
                    href={`/dashboard/editor/submissions/${article.id || article.submission_id}`}
                    className="shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition-all text-sm font-medium border border-emerald-500/20 hover:border-emerald-500"
                  >
                    Kelola Naskah
                    <ArrowRight className="w-4 h-4" />
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
