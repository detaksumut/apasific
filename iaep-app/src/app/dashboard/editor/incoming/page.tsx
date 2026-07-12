import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Eye, CheckCircle, XCircle } from "lucide-react";
import { cookies } from "next/headers";

export default async function IncomingArticles() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  const mockUserCookie = cookieStore.get("mock_user");

  if (!user && !mockUserCookie) {
    redirect("/auth/login");
  }

  // Fetch submissions that are newly submitted or awaiting reviewers
  const { data: submissions, error } = await supabase
    .from("submissions")
    .select("*, journals(name), profiles:author_id(full_name)")
    .in("status", ["queued", "submitted", "pending", "Awaiting Reviewers"])
    .order("created_at", { ascending: false });

  const articles = submissions || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Artikel Masuk (Incoming)</h1>
          <p className="text-zinc-400 mt-2 text-sm">Daftar naskah baru yang siap diproses dan ditugaskan ke reviewer.</p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#c9a84c]" />
            Naskah Baru
          </h2>
        </div>
        
        {articles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-white font-medium mb-1">Belum ada artikel masuk</h3>
            <p className="text-zinc-500 text-sm">Tidak ada naskah baru yang menunggu untuk diproses saat ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {articles.map((article: any) => (
              <div key={article.id} className="p-6 hover:bg-zinc-800/30 transition-colors group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {article.journals?.name || "Jurnal Tidak Diketahui"}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20">
                        {article.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-[#c9a84c] transition-colors line-clamp-1">
                      {article.title}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      Author: <span className="text-zinc-300">{article.profiles?.full_name || 'Penulis'}</span> &bull; 
                      Disubmit pada: {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/20">
                      <CheckCircle className="w-4 h-4" /> Terima & Teruskan
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20">
                      <XCircle className="w-4 h-4" /> Tolak (Desk Reject)
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
