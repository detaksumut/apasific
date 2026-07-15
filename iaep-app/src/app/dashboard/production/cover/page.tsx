import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, ArrowRight, Image as ImageIcon } from "lucide-react";
import { cookies } from "next/headers";

export default async function CoverEditorDashboard() {
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

  let articles: any[] = [];
  let completedArticles: any[] = [];
  try {
    const { data: queueSubmissions } = await supabase
      .from("submissions")
      .select("*, journals(name), profiles:author_id(full_name)")
      .eq("stage", "Copyediting")
      .eq("status", "Assigned to Cover")
      .order("created_at", { ascending: false });
    
    if (queueSubmissions) articles = [...queueSubmissions];

    const { data: doneSubmissions } = await supabase
      .from("submissions")
      .select("*, journals(name), profiles:author_id(full_name)")
      .not("cover_file_url", "is", null)
      .neq("status", "Assigned to Cover")
      .order("created_at", { ascending: false })
      .limit(10);

    if (doneSubmissions) completedArticles = [...doneSubmissions];
  } catch (e) {
    console.error("Supabase fetch error", e);
  }

  try {
    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();
    const submissionsSnapshot = await db.collection('submissions').orderBy('created_at', 'desc').get();
    const fbAllArticles = submissionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
          id: doc.id,
          title: data.title,
          stage: data.stage,
          status: data.status,
          cover_file_url: data.cover_file_url,
          created_at: data.created_at && data.created_at.toDate ? data.created_at.toDate() : new Date(),
          journals: data.journals || { name: 'Unknown Journal' },
          profiles: { full_name: data.author || 'Author' }
      };
    });
    
    // Merge avoiding duplicates
    const existingIds = new Set(articles.map(a => a.id));
    for (const fb of fbAllArticles.filter(a => a.stage === "Copyediting" && a.status === "Assigned to Cover")) {
        if (!existingIds.has(fb.id)) {
            articles.push(fb);
        }
    }

    const existingDoneIds = new Set(completedArticles.map(a => a.id));
    for (const fb of fbAllArticles.filter(a => a.cover_file_url && a.status !== "Assigned to Cover")) {
        if (!existingDoneIds.has(fb.id)) {
            completedArticles.push(fb);
        }
    }
  } catch (fbErr) {
    console.error("Firestore fetch failed", fbErr);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Cover Editor</h1>
          <p className="text-zinc-400 mt-2 text-sm">Daftar naskah yang menunggu pembuatan desain sampul (cover) jurnal.</p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden mb-8">
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-500" />
            Antrean Cover
          </h2>
        </div>
        
        {articles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-white font-medium mb-1">Belum ada antrean cover</h3>
            <p className="text-zinc-500 text-sm">Semua naskah telah selesai dikerjakan.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {articles.map((article: any) => (
              <div key={article.id} className="p-6 hover:bg-zinc-800/30 transition-colors group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {article.journals?.name || "Jurnal"}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Menunggu Cover
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                      {article.title}
                    </h3>
                  </div>
                  
                  <div className="shrink-0">
                    <Link href={`/dashboard/editor/submissions/${article.id}?tab=copyediting`} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded text-sm flex items-center gap-2 transition-colors">
                      Buka Auto-Cover Studio
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-500" />
            Riwayat Cover Selesai (Pertinggal)
          </h2>
        </div>
        
        {completedArticles.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-zinc-500 text-sm">Belum ada riwayat pembuatan cover.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {completedArticles.map((article: any) => (
              <div key={article.id} className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg overflow-hidden group">
                <div className="h-48 bg-zinc-800 relative overflow-hidden">
                   {article.cover_file_url ? (
                     <img src={article.cover_file_url} alt="Cover Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-zinc-600">No Image</div>
                   )}
                   <div className="absolute top-2 right-2 bg-green-500/90 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                     Selesai
                   </div>
                </div>
                <div className="p-4">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 line-clamp-1">{article.journals?.name}</div>
                  <h3 className="text-sm font-semibold text-white line-clamp-2 mb-3" title={article.title}>{article.title}</h3>
                  <Link href={`/dashboard/editor/submissions/${article.id}?tab=production`} className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1">
                    Lihat Naskah <ArrowRight className="w-3 h-3" />
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
