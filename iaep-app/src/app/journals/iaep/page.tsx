"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

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
              <div key={idx} className="bg-[#111120] border border-gray-800 rounded-xl p-8 hover:border-[#c9a84c]/50 transition-all flex flex-col md:flex-row gap-8 items-start">
                
                {/* Cover Image Preview if exists */}
                {art.cover_file_url && (
                  <div className="w-full md:w-44 flex-shrink-0 border border-zinc-800 rounded-lg overflow-hidden shadow-md aspect-[1/1.414] relative bg-black/20" style={{ containerType: 'inline-size' }}>
                    <img src={art.cover_file_url} alt="Cover" className="w-full h-full object-cover relative z-0" />
                    {art.doi && (
                      <a 
                        href={art.doi.includes('zenodo.') ? `https://zenodo.org/records/${art.doi.split('zenodo.')[1]}` : `https://doi.org/${art.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute z-10 font-bold flex items-center hover:underline hover:text-emerald-300 transition-colors" 
                        style={{
                          top: (() => {
                            const displayTitle = (art.title || 'Untitled Article').split(':')[0].trim();
                            const words = displayTitle.split(' ');
                            let lines = 1;
                            let currentLineLength = 0;
                            for (let word of words) {
                              if (currentLineLength + word.length > 28 && currentLineLength > 0) {
                                lines++;
                                currentLineLength = word.length + 1;
                              } else {
                                currentLineLength += word.length + 1;
                              }
                            }
                            const endY = 460 + (lines - 1) * 85;
                            const tableY = endY + 140;
                            const cellTop = tableY + 55;
                            return `calc(${(cellTop / 1754) * 100}% + 2px)`;
                          })(),
                          left: 'calc(62.096% + 2px)',
                          width: 'calc(28.225% - 4px)',
                          height: 'calc(8.266% - 4px)',
                          backgroundColor: '#1b263b',
                          fontSize: '1.75cqw',
                          whiteSpace: 'nowrap',
                          color: '#fff',
                          paddingLeft: '0.5cqw',
                          textDecoration: 'none'
                        }}
                      >
                        DOI: {art.doi}
                      </a>
                    )}
                  </div>
                )}

                <div className="flex-grow">
                  <div className="text-sm font-bold text-[#c9a84c] mb-3">
                    Terbit: {art.created_at ? new Date(art.created_at).toLocaleDateString('id-ID') : "Baru"} {art.doi && `• DOI: ${art.doi}`}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4 leading-snug">
                    {art.title}
                  </h2>
                  <div className="text-gray-400 font-medium mb-4 flex gap-2 flex-wrap">
                    Oleh: 
                    <span className="text-gray-200 bg-[#1a1a2e] px-2 py-0.5 rounded text-sm">
                      {art.author}
                    </span>
                  </div>
                  
                  <p className="text-gray-500 mb-6 line-clamp-3">
                    {art.abstract}
                  </p>

                  <div className="flex gap-4">
                    <Link 
                      href={`/article/${art.id}`} 
                      className="bg-transparent border border-[#c9a84c] text-[#c9a84c] px-6 py-2 rounded-lg font-bold hover:bg-[#c9a84c]/10 transition-colors"
                    >
                      View Details
                    </Link>
                    <button disabled className="bg-gray-800 text-gray-500 px-6 py-2 rounded-lg font-bold cursor-not-allowed">
                      PDF Terkunci
                    </button>
                  </div>
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
