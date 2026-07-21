import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import { cookies } from "next/headers";

export default async function LayoutEditorDashboard() {
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
    const { data: submissions, error } = await supabase
      .from("submissions")
      .select("*, journals(name), profiles:author_id(full_name)")
      .eq("stage", "Copyediting")
      .eq("status", "Assigned to Layout")
      .order("created_at", { ascending: false });
    
    if (submissions && submissions.length > 0) {
        articles = [...submissions];
    }
    
    const { data: doneSubmissions } = await supabase
      .from("submissions")
      .select("*, journals(name), profiles:author_id(full_name)")
      .neq("status", "Assigned to Layout")
      .order("created_at", { ascending: false })
      .limit(100);

    if (doneSubmissions) completedArticles = [...doneSubmissions];
  } catch (e) {
    console.error("Supabase fetch error", e);
  }

  try {
    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();
    const submissionsSnapshot = await db.collection('submissions').orderBy('created_at', 'desc').get();
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
    }).filter(article => article.stage === "Copyediting" && article.status === "Assigned to Layout");
    
    // Merge avoiding duplicates if any for Queue
    const existingIds = new Set(articles.map(a => a.id));
    for (const fb of fbArticles) {
        if (!existingIds.has(fb.id)) {
            articles.push(fb);
        }
    }
    
    const fbAllArticles = submissionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
          id: doc.id,
          title: data.title,
          stage: data.stage,
          status: data.status,
          created_at: data.created_at && data.created_at.toDate ? data.created_at.toDate() : new Date(),
          journals: data.journals || { name: 'Unknown Journal' },
          profiles: { full_name: data.author || 'Author' },
          file_url_galley: data.file_url_galley
      };
    });

    const finalCompletedArticles = [];
    const existingDoneIds = new Set();

    for (const supa of completedArticles) {
       const fbMatch = fbAllArticles.find(a => a.id === supa.id);
       if (fbMatch && fbMatch.file_url_galley) {
           supa.file_url_galley = fbMatch.file_url_galley;
           finalCompletedArticles.push(supa);
           existingDoneIds.add(supa.id);
       }
    }

    for (const fb of fbAllArticles.filter(a => a.file_url_galley && a.status !== "Assigned to Layout")) {
        if (!existingDoneIds.has(fb.id)) {
            finalCompletedArticles.push(fb);
            existingDoneIds.add(fb.id);
        }
    }
    completedArticles = finalCompletedArticles;

  } catch (fbErr) {
    console.error("Firestore fetch failed", fbErr);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Layout Editor</h1>
          <p className="text-zinc-400 mt-2 text-sm">Daftar naskah yang menunggu proses tata letak (formatting & typesetting) menjadi Galley PDF.</p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Antrean Layout
          </h2>
        </div>
        
        {articles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-white font-medium mb-1">Belum ada antrean layout</h3>
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
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Menunggu Layout
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {article.title}
                    </h3>
                  </div>
                  
                  <div className="shrink-0">
                    <Link href={`/dashboard/editor/submissions/${article.id}?tab=copyediting`} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded text-sm flex items-center gap-2 transition-colors">
                      Kerjakan Layout
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEKSI PERTINGGAL / HISTORY LAYOUT */}
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden mt-8">
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Riwayat / Pertinggal
          </h2>
          <span className="text-xs font-medium bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full border border-zinc-700">
            {completedArticles.length} Naskah
          </span>
        </div>

        {completedArticles.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-zinc-500 text-sm">Belum ada riwayat pengerjaan layout.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50 max-h-[500px] overflow-y-auto">
            {completedArticles.map((article: any) => (
              <div key={article.id} className="p-4 hover:bg-zinc-800/30 transition-colors group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {article.journals?.name || "Unknown Journal"}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        Selesai Dikerjakan
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors line-clamp-1">
                      {article.title}
                    </h3>
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-2">
                   {article.file_url_galley && (
                     <a href={article.file_url_galley} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-full transition-colors" title="Lihat Galley (Buka di tab baru)">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                     </a>
                   )}
                   <Link href={`/dashboard/editor/submissions/${article.id}?tab=production`} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2 px-3 rounded flex items-center gap-2 transition-colors">
                      Lihat Naskah <ArrowRight className="w-3 h-3" />
                   </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
