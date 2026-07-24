import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ShieldCheck, CheckCircle2, ArrowRight, FileText, ExternalLink } from "lucide-react";

export default async function ProductionResultsPage() {
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

  let productionArticles: any[] = [];
  try {
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    const { data: supaData } = await supabaseAdmin
      .from("submissions")
      .select("*, journals(name), profiles:author_id(full_name)")
      .order("updated_at", { ascending: false });

    if (supaData) {
      const isProductionResult = (a: any) => 
        ["Production Completed", "Pending Supervisor", "Published"].includes(a.status) ||
        (a.stage === "Production" && Boolean(a.cover_file_url || a.doi));

      const filtered = supaData.filter(isProductionResult);

      // Title Deduplication
      const seenTitles = new Set<string>();
      productionArticles = filtered.filter(a => {
        const clean = (a.title || '').trim().toLowerCase();
        if (!clean || seenTitles.has(clean)) return false;
        seenTitles.add(clean);
        return true;
      });
    }
  } catch (e) {
    console.error("Fetch production results error", e);
  }

  const getDisciplineCode = (jName?: string, titleStr?: string) => {
    const name = (jName || '').toUpperCase();
    const title = (titleStr || '').toLowerCase();
    if (name.includes('AJAF') || name.includes('AKUNTANSI') || title.includes('zakat') || title.includes('accounting') || title.includes('tax')) {
      return 'AJAF - ACCOUNTING, AUDITING & TAXATION';
    }
    if (name.includes('AJITE') || name.includes('KOMPUTER') || title.includes('technology') || title.includes('software')) {
      return 'AJITE - TEKNOLOGI INFORMASI & ILMU KOMPUTER';
    }
    if (name.includes('AJCS') || name.includes('COMMUNITY')) {
      return 'AJCS - PENGABDIAN KEPADA MASYARAKAT';
    }
    if (name.includes('AJEP') || name.includes('ECONOMICS')) {
      return 'AJEP - EKONOMI & KEBIJAKAN';
    }
    return name ? `${name.split('-')[0].trim()} - DISIPLIN ILMU` : 'AJAF - ACCOUNTING, AUDITING & TAXATION';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-full font-bold uppercase tracking-wider">
              Menu Editorial
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Hasil Produksi (Dari Supervisor)</h1>
          <p className="text-zinc-400 mt-2 text-sm max-w-3xl">
            Arsip naskah hasil akhir produksi yang telah diverifikasi dan dikirim oleh Supervisor, siap untuk diterbitkan ke publik.
          </p>
        </div>
        <div className="shrink-0 bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-right">
          <p className="text-xs text-zinc-400 font-semibold uppercase">Total Naskah Produksi</p>
          <p className="text-2xl font-black text-emerald-400 mt-0.5">{productionArticles.length}</p>
        </div>
      </div>

      {/* Articles Grid */}
      {productionArticles.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-zinc-800/60 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-white font-bold text-lg mb-1">Belum Ada Hasil Produksi</h3>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Naskah yang telah selesai diproses oleh Layout, Cover, Publish Editor & disahkan oleh Supervisor akan otomatis muncul di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {productionArticles.map((article) => {
            const discCode = getDisciplineCode(article.journals?.name, article.title);
            const isPublished = article.status === 'Published';
            const isReadyToPublish = article.status === 'Production Completed';

            return (
              <div 
                key={article.id} 
                className="bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/40 rounded-2xl p-6 shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
              >
                {/* Left: Cover Preview */}
                <div className="lg:col-span-3 flex justify-center">
                  <div className="relative w-full max-w-[200px] aspect-[1/1.5] rounded-xl overflow-hidden shadow-2xl border border-zinc-700 bg-[#06142e] group">
                    <img 
                      src={article.cover_file_url || '/coverPKM.png'} 
                      alt={article.title} 
                      className="w-full h-full object-cover" 
                    />
                    {article.cover_file_url && (
                      <div 
                        className="absolute font-serif drop-shadow-md overflow-hidden"
                        style={{
                          top: '34.5%',
                          left: '6%',
                          width: '46%',
                          maxHeight: '59.5%',
                        }}
                      >
                        <div className="mb-1">
                          <span 
                            className="inline-block font-sans font-extrabold text-[#f0c05a] bg-black/80 border border-[#f0c05a]/60 px-1 py-0.5 rounded tracking-wider uppercase shadow-md"
                            style={{ fontSize: 'clamp(5.5px, 0.55vw, 8px)' }}
                          >
                            {discCode}
                          </span>
                        </div>
                        {article.title && article.title.includes(":") ? (
                          <>
                            <div 
                              className="font-bold leading-tight mb-0.5 text-[#c9a84c]" 
                              style={{ fontSize: 'clamp(8.5px, 0.85vw, 12px)' }}
                            >
                              {article.title.split(":")[0].trim()}:
                            </div>
                            <div 
                              className="font-normal text-gray-200" 
                              style={{ fontSize: 'clamp(6.5px, 0.65vw, 9.5px)', lineHeight: '1.25' }}
                            >
                              {article.title.split(":").slice(1).join(":").trim()}
                            </div>
                          </>
                        ) : (
                          <div 
                            className="font-bold leading-snug text-[#c9a84c]" 
                            style={{ fontSize: 'clamp(8.5px, 0.85vw, 12px)' }}
                          >
                            {article.title}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Middle: Details */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold rounded-lg font-mono uppercase">
                      [{discCode}]
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      isPublished ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      isReadyToPublish ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                      'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}>
                      {isPublished ? '✓ Diterbitkan (Published)' : isReadyToPublish ? '● Siap Terbit (Production Completed)' : article.status}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-white leading-snug hover:text-emerald-400 transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Penulis: <span className="text-zinc-200 font-semibold">{article.profiles?.full_name || article.author || 'Penulis'}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs text-zinc-400 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-zinc-500">Jurnal Publikasi</span>
                      <span className="text-zinc-200 font-medium">{article.journals?.name || 'Jurnal'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-zinc-500">Digital Object Identifier (DOI)</span>
                      <span className="text-emerald-400 font-mono font-bold">{article.doi || 'Dalam Proses'}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="lg:col-span-3 flex flex-col gap-3 justify-center">
                  <Link
                    href={`/dashboard/editor/submissions/${article.id}?tab=production`}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 text-center"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isPublished ? 'Kelola Publikasi' : 'Buka & Terbitkan'}
                  </Link>

                  {isPublished && (
                    <Link
                      href={`/article/${article.id}`}
                      target="_blank"
                      className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors border border-zinc-700 text-center"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Lihat Artikel Publik
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
