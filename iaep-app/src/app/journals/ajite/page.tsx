import React from "react";
import Link from "next/link";
import { CheckCircle2, ChevronLeft, FileText, ArrowRight } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import DynamicCover from "@/components/DynamicCover";

// Buat Supabase client dengan Service Role Key untuk bypass RLS (karena ini halaman publik)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export const revalidate = 0; // Disable caching so it always fetches fresh data

export default async function AJITEJournal() {
  let articles: any[] = [];
  
  // 1. Coba ambil dari Supabase terlebih dahulu (primary database)
  try {
    // Pertama, cari journal_id untuk AJITE
    const { data: journals } = await supabaseAdmin
      .from('journals')
      .select('id, name')
      .ilike('name', '%AJITE%');
    
    const ajiteJournalIds = journals?.map((j: any) => j.id) || [];
    
    let supabaseQuery = supabaseAdmin
      .from("submissions")
      .select(`id, title, abstract, status, created_at, doi, volume, issue, cover_file_url, journal_id, journals(name)`)
      .eq("status", "Published")
      .order("created_at", { ascending: false });

    // Filter by journal_id jika tersedia (lebih akurat)
    if (ajiteJournalIds.length > 0) {
      supabaseQuery = supabaseQuery.in('journal_id', ajiteJournalIds);
    }

    const { data, error } = await supabaseQuery;

    if (!error && data && data.length > 0) {
      articles = data;
    } else if (!error && data && data.length === 0 && ajiteJournalIds.length === 0) {
      // Fallback: filter by nama jurnal jika journal_id tidak ditemukan
      const { data: allData } = await supabaseAdmin
        .from("submissions")
        .select(`id, title, abstract, status, created_at, doi, volume, issue, cover_file_url, journal_id, journals(name)`)
        .eq("status", "Published")
        .order("created_at", { ascending: false });
      
      if (allData) {
        articles = allData.filter((pub: any) =>
          pub.journals?.name?.toUpperCase().includes("AJITE")
        );
      }
    } else if (error) {
      console.error("Supabase Error:", error.message || error);
    }
  } catch (err) {
    console.error("Fetch Error:", err);
  }


  return (
    <div className="min-h-screen text-[#e8e8f0] font-sans pt-24 pb-20 bg-[#0a0a0a]">
      <div className="container mx-auto px-6 max-w-6xl">
        
        <Link href="/journals" className="inline-flex items-center text-emerald-500 hover:text-emerald-400 mb-8 font-bold transition-colors">
          <ChevronLeft className="w-5 h-5 mr-2" />
          Kembali ke Repositori Jurnal
        </Link>

        <div className="mb-12 border-b border-zinc-800 pb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-white flex items-center gap-4">
            <span className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl text-2xl font-black">AJITE</span>
            Journal of IT & Engineering
          </h1>
          <p className="text-zinc-400 text-lg max-w-3xl">
            Repositori resmi publikasi artikel ilmiah untuk <strong className="text-emerald-500">AJITE (APASIFIC Journal of IT & Engineering)</strong>. 
            Semua naskah di bawah ini telah melalui proses telaah sejawat (*peer-review*) dan dinyatakan sah untuk dipublikasikan.
          </p>
        </div>

        <div className="space-y-8">
          {articles.map((pub, idx) => (
            <div key={idx} className="bg-[#111111] border border-zinc-800 rounded-2xl overflow-hidden flex flex-col md:flex-row hover:border-emerald-500/30 transition-all group shadow-lg">
              
              {/* Info Section */}
              <div className="flex-1 p-6 md:p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
                    #sub_{pub.id.substring(0,8)}
                  </span>
                  <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                    {pub.journals?.name || "AJITE - JOURNAL OF IT & ENGINEERING"}
                  </span>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-snug group-hover:text-emerald-400 transition-colors">
                  {pub.title}
                </h2>
                
                {pub.abstract && (
                  <p className="text-zinc-400 mb-6 line-clamp-[12] text-sm leading-relaxed">
                    {(() => {
                      try {
                        const abs = JSON.parse(pub.abstract);
                        return abs.abstract_en || abs.abstract || pub.abstract;
                      } catch(e) { return pub.abstract; }
                    })()}
                  </p>
                )}

                <div className="mt-auto pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800/60">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-500">
                      <CheckCircle2 className="w-4 h-4" />
                      Status: {pub.status}
                    </div>
                    <span className="text-zinc-600 text-sm font-medium">
                      •
                    </span>
                    <div className="text-sm text-zinc-500 font-medium">
                      Dikirim: {new Date(pub.created_at).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                  
                  <Link href={`/article/${pub.id}`} className="inline-flex items-center text-sm font-bold text-white bg-zinc-800 hover:bg-emerald-600 px-4 py-2 rounded-lg transition-colors">
                    Lihat Artikel <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>

              {/* Cover Section */}
              <div className="w-full md:w-[320px] bg-zinc-900/50 p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-zinc-800">
                <div className="text-[10px] font-bold tracking-widest text-emerald-500/70 uppercase mb-4 text-center">
                  SAMPUL DEPAN (COVER)
                </div>
                {pub.cover_file_url ? (
                  <div className="relative w-full aspect-[1/1.4] rounded-lg overflow-hidden border border-zinc-700 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    <img
                      src={pub.cover_file_url}
                      alt={`Cover ${pub.title}`}
                      className="w-full h-full object-cover"
                    />
                    {pub.doi && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-3 border-t border-emerald-500/50 flex flex-col items-center justify-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">DOI</span>
                        <span className="text-xs font-mono text-emerald-400 font-bold">{pub.doi}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full">
                    <DynamicCover
                      journalName={pub.journals?.name || "AJITE - Ilmu Komputer & Teknologi Informasi"}
                      title={pub.title}
                      author={(() => {
                        try {
                          const abs = JSON.parse(pub.abstract || '{}');
                          return abs.authors?.map((a: any) => a.full_name).join(', ') || 'APASIFIC Author';
                        } catch(e) { return 'APASIFIC Author'; }
                      })()}
                      doi={pub.doi || ''}
                      volume={pub.volume || '1'}
                      edisi={pub.issue || '1'}
                    />
                  </div>
                )}
              </div>

            </div>
          ))}
          
          {articles.length === 0 && (
            <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-zinc-800">
              <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-lg">Belum ada artikel yang diterbitkan pada jurnal ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
