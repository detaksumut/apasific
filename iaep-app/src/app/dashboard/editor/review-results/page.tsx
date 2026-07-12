import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardCheck, FileText, CheckCircle, Search, Eye } from "lucide-react";
import { cookies } from "next/headers";

export default async function ReviewResultsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  const mockUserCookie = cookieStore.get("mock_user");

  if (!user && !mockUserCookie) {
    redirect("/auth/login");
  }

  // Fetch submissions that have been reviewed or are under review
  const { data: submissions, error } = await supabase
    .from("submissions")
    .select("*, journals(name), profiles:author_id(full_name)")
    .in("status", ["Under Review", "Reviewed", "Revision Required"])
    .order("updated_at", { ascending: false });

  const articles = submissions || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Pemeriksaan Hasil Review</h1>
          <p className="text-zinc-400 mt-2 text-sm">Periksa catatan dari mitra bestari (reviewer) dan ambil keputusan editorial.</p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[#c9a84c]" />
            Naskah Dalam Proses Evaluasi
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
              <ClipboardCheck className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-white font-medium mb-1">Belum ada hasil review</h3>
            <p className="text-zinc-500 text-sm">Tidak ada naskah yang selesai direview saat ini.</p>
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
                      {article.status === 'Reviewed' ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Selesai Direview
                        </span>
                      ) : article.status === 'Revision Required' ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                          Menunggu Revisi Author
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Sedang Direview
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-[#c9a84c] transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      Author: <span className="text-zinc-300">{article.profiles?.full_name || 'Penulis'}</span> &bull; 
                      Update terakhir: {new Date(article.updated_at || article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700">
                      <Eye className="w-4 h-4 text-zinc-400" /> Lihat Detail
                    </button>
                    {article.status === 'Reviewed' && (
                      <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-black bg-[#c9a84c] hover:bg-[#e8c97a] rounded-lg transition-colors shadow-[0_0_15px_rgba(201,168,76,0.2)]">
                        <CheckCircle className="w-4 h-4" /> Buat Keputusan
                      </button>
                    )}
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
