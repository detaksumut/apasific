import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Eye, CheckCircle, XCircle, Search, FileSignature } from "lucide-react";
import { cookies } from "next/headers";

export default async function DecisionsHistoryPage() {
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
        } catch (e) { }
        
        if (!user && fallbackUserId) {
           user = { id: fallbackUserId, email: "editor@fallback.local" } as any;
        }
    }
  }

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch submissions that have a final or intermediate decision using supabaseAdmin
  let articles: any[] = [];
  try {
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    const { data: supaData } = await supabaseAdmin
      .from("submissions")
      .select("*, journals(name)")
      .order("updated_at", { ascending: false });

    if (supaData) {
      const isDecisionDoc = (a: any) => 
        ["Accepted", "accepted", "Rejected", "Published", "Production Completed"].includes(a.status) || 
        Boolean(a.doi || a.zenodo_id);

      const filtered = supaData.filter(isDecisionDoc);

      // Title Deduplication
      const seenTitles = new Set<string>();
      articles = filtered.filter(a => {
        const clean = (a.title || '').trim().toLowerCase();
        if (!clean || seenTitles.has(clean)) return false;
        seenTitles.add(clean);
        return true;
      });
    }
  } catch (e) {
    console.error("Fetch error in DecisionsHistoryPage:", e);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Riwayat Keputusan</h1>
          <p className="text-zinc-400 mt-2 text-sm">Arsip naskah yang telah diberikan keputusan akhir (Accepted / Rejected / Published).</p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-[#c9a84c]" />
            Daftar Keputusan Editorial
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cari naskah..." 
              className="w-full pl-9 pr-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all"
            />
          </div>
        </div>
        
        {articles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileSignature className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-white font-medium mb-1">Belum ada riwayat keputusan</h3>
            <p className="text-zinc-500 text-sm">Keputusan editorial yang Bapak/Ibu buat akan muncul di halaman ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {articles.map((article: any) => (
              <div key={article.id} className="p-6 hover:bg-zinc-800/30 transition-colors group">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {article.journals?.name || "Jurnal Tidak Diketahui"}
                      </span>
                      {article.status.toLowerCase() === 'accepted' ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Accepted
                        </span>
                      ) : article.status === 'Published' ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Published
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Rejected
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-[#c9a84c] transition-colors line-clamp-1">
                      {article.title}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      Author: <span className="text-zinc-300">{article.profiles?.full_name || 'Penulis'}</span> &bull; 
                      Tanggal Keputusan: {new Date(article.updated_at || article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700">
                      <Eye className="w-4 h-4 text-zinc-400" /> Lihat Catatan
                    </button>
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
