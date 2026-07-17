"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, FileText } from "lucide-react";

export default function IAEPArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIAEP() {
      try {
        const { getPublishedArticles } = await import("@/app/actions/editor");
        const res = await getPublishedArticles();

        if (res.success && res.articles) {
          setArticles(res.articles);
        }
      } catch (err) {
        console.error("Gagal memuat artikel IAEP:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchIAEP();
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
            Daftar Artikel <span className="text-[#c9a84c]">APASIFIC IAEP</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Terbitan resmi International Academic Exchange Program Journal (IAEP)
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#c9a84c] font-bold animate-pulse">
            Menyerap data dari server APASIFIC...
          </div>
        ) : (
          <div className="grid gap-6">
            {articles.map((art, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-8 items-stretch border border-zinc-800 rounded-xl overflow-hidden bg-[#0d0d14] shadow-2xl hover:border-zinc-700 transition-colors group">
                
                {/* Info Section */}
                <div className="flex-1 p-6 md:p-8 flex flex-col">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
                      #sub_{art.id?.substring(0,8) || 'iaep'}
                    </span>
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                      {art.journals?.name || "IAEP - INTERNATIONAL ACADEMIC EXCHANGE PROGRAM"}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-snug group-hover:text-emerald-400 transition-colors">
                    {art.title}
                  </h2>
                  
                  {art.abstract && (
                    <p className="text-zinc-400 mb-6 line-clamp-[12] text-sm leading-relaxed">
                      {(() => {
                        try {
                          const abs = JSON.parse(art.abstract);
                          return abs.abstract_en || abs.abstract || art.abstract;
                        } catch(e) { return art.abstract; }
                      })()}
                    </p>
                  )}

                  <div className="mt-auto pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800/60">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-500">
                        <CheckCircle2 className="w-4 h-4" />
                        Status: {art.status || "Published"}
                      </div>
                      <span className="text-zinc-600 text-sm font-medium">
                        •
                      </span>
                      <div className="text-sm text-zinc-500 font-medium">
                        Dikirim: {art.created_at ? new Date(art.created_at).toLocaleDateString('id-ID') : "Baru"}
                      </div>
                    </div>
                    
                    <Link href={`/article/${art.id}`} className="inline-flex items-center text-sm font-bold text-white bg-zinc-800 hover:bg-emerald-600 px-4 py-2 rounded-lg transition-colors">
                      Lihat Artikel <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>

                {/* Cover Section */}
                <div className="w-full md:w-[320px] bg-zinc-900/50 p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-zinc-800">
                  <div className="text-[10px] font-bold tracking-widest text-emerald-500/70 uppercase mb-4 text-center">
                    SAMPUL DEPAN (COVER)
                  </div>
                  {art.cover_file_url ? (
                    <div 
                      className="relative w-full aspect-[1/1.4] rounded-lg overflow-hidden border border-zinc-700 shadow-2xl group-hover:scale-105 transition-transform duration-500"
                      style={{ containerType: 'inline-size' }}
                    >
                      <img 
                        src={art.cover_file_url} 
                        alt={`Cover ${art.title}`} 
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Overlay teks DOI pas di atas garis ____________ tabel cover */}
                      {art.doi && (
                        <div 
                          className="absolute z-10 text-white font-bold font-sans tracking-tight"
                          style={{ top: '49.5%', left: '77%', fontSize: '2.1cqw' }}
                        >
                          {art.doi.replace('10.5281/', '')}
                        </div>
                      )}
                      {/* Overlay DOI di atas gambar (bagian bawah gambar) agar tidak merusak file asli */}
                      {art.doi && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-3 border-t border-emerald-500/50 flex flex-col items-center justify-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Digital Object Identifier</span>
                          <span className="text-xs font-mono text-emerald-400 font-bold">{art.doi}</span>
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
                  {art.doi && (
                    <div className="mt-4 w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-center">
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider mb-0.5">DOI Tertaud:</span>
                      <a href={`https://doi.org/${art.doi.trim()}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-emerald-500 hover:underline">
                        {art.doi}
                      </a>
                    </div>
                  )}
                </div>

              </div>
            ))}
            
            {articles.length === 0 && (
              <div className="text-center py-20 text-gray-500 bg-[#111120] border border-gray-800 rounded-xl">
                Belum ada artikel yang diterbitkan untuk jurnal ini.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
