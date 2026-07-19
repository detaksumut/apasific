"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { CheckCircle2, ArrowRight, FileText } from "lucide-react";

// Koneksi ke Database RJRAKP secara langsung (Standar API Integration)
const rjrakpDbUrl = 'https://abmjieqcumlskannfkdl.supabase.co';
const rjrakpDbKey = 'sb_publishable_Zvx-3Ezgb1jnAZsDGXyUOg_96PqXzRN';
const supabase = createClient(rjrakpDbUrl, rjrakpDbKey);

export default function RJRAKPArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRJRAKP() {
      try {
        // Menyedot data (Harvesting) menggunakan API standar
        const { data, error } = await supabase
          .from('publications')
          .select(`
            id,
            publication_date,
            doi,
            articles!inner (
              id,
              title,
              abstract,
              article_authors ( full_name, affiliation )
            )
          `)
          .order('publication_date', { ascending: false });

        if (!error && data) {
          setArticles(data);
        }
      } catch (err) {
        console.error("Gagal menyedot data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRJRAKP();
  }, []);

  return (
    <div className="min-h-screen text-[#e8e8f0] font-sans pt-24 pb-20 bg-[#05050a]">
      <div className="container mx-auto px-6 max-w-6xl">
        
        <Link href="/journals" className="inline-flex items-center text-[#c9a84c] hover:text-[#e8c97a] mb-8 font-bold transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Repositori Jurnal
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-['Cinzel'] mb-4 leading-tight text-white">
            Daftar Artikel <span className="text-[#c9a84c]">RJRAKP</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Terintegrasi langsung secara otomatis menggunakan protokol API dari rjrakp.com
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#c9a84c] font-bold animate-pulse">
            Menyedot data dari server RJRAKP...
          </div>
        ) : (
          <div className="grid gap-6">
            {articles.map((pub, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-8 items-stretch border border-zinc-800 rounded-xl overflow-hidden bg-[#0d0d14] shadow-2xl hover:border-zinc-700 transition-colors group">
                
                {/* Info Section */}
                <div className="flex-1 p-6 md:p-8 flex flex-col">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
                      #pub_{pub.id?.substring(0,8) || 'rjrakp'}
                    </span>
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                      RJRAKP
                    </span>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-snug group-hover:text-emerald-400 transition-colors">
                    {pub.articles?.title}
                  </h2>
                  
                  {pub.articles?.abstract && (
                    <p className="text-zinc-400 mb-6 line-clamp-6 text-sm leading-relaxed">
                      {(() => {
                        try {
                          const abs = JSON.parse(pub.articles.abstract);
                          return abs.abstract_en || abs.abstract || pub.articles.abstract;
                        } catch(e) { return pub.articles.abstract; }
                      })()}
                    </p>
                  )}

                  <div className="mt-auto pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800/60">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-500">
                        <CheckCircle2 className="w-4 h-4" />
                        Status: Published
                      </div>
                      <span className="text-zinc-600 text-sm font-medium">
                        •
                      </span>
                      <div className="text-sm text-zinc-500 font-medium">
                        Dikirim: {pub.publication_date ? new Date(pub.publication_date).toLocaleDateString('id-ID') : "Baru"}
                      </div>
                    </div>
                    
                    <Link href={`/article/${pub.articles?.id || '1045'}`} className="inline-flex items-center text-sm font-bold text-white bg-zinc-800 hover:bg-emerald-600 px-4 py-2 rounded-lg transition-colors">
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
                    <div 
                      className="relative w-full aspect-[1/1.4] rounded-lg overflow-hidden border border-zinc-700 shadow-2xl group-hover:scale-105 transition-transform duration-500"
                      style={{ containerType: 'inline-size' }}
                    >
                      <img 
                        src={pub.cover_file_url} 
                        alt={`Cover ${pub.articles?.title}`} 
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Overlay DOI di atas gambar (bagian bawah gambar) agar tidak merusak file asli */}
                      {pub.doi && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-3 border-t border-emerald-500/50 flex flex-col items-center justify-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Digital Object Identifier</span>
                          <span className="text-xs font-mono text-emerald-400 font-bold">{pub.doi}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full aspect-[1/1.4] rounded-lg border border-dashed border-zinc-700 flex flex-col items-center justify-center bg-zinc-900">
                      <FileText className="w-12 h-12 text-zinc-700 mb-2" />
                      <span className="text-xs text-zinc-600 font-medium text-center px-4">Sampul belum diunggah</span>
                    </div>
                  )}
                  {/* Teks DOI statis di bawah gambar sampul */}
                  {pub.doi && (
                    <div className="mt-4 w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-center">
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider mb-0.5">DOI Tertaud:</span>
                      <a href={`https://doi.org/${pub.doi.trim()}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-emerald-500 hover:underline">
                        {pub.doi}
                      </a>
                    </div>
                  )}
                </div>

              </div>
            ))}
            
            {articles.length === 0 && (
              <div className="text-center py-10 text-gray-500">Tidak ada artikel ditemukan.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
