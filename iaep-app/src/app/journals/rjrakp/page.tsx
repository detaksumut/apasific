"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

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
              <div key={idx} className="bg-[#111120] border border-gray-800 rounded-xl p-8 hover:border-[#c9a84c]/50 transition-colors">
                <div className="text-sm font-bold text-[#c9a84c] mb-3">
                  Terbit: {new Date(pub.publication_date).toLocaleDateString('id-ID')} {pub.doi && `• DOI: ${pub.doi}`}
                </div>
                <h2 className="text-2xl font-bold text-white mb-4 leading-snug">
                  {pub.articles?.title}
                </h2>
                <div className="text-gray-400 font-medium mb-4 flex gap-2 flex-wrap">
                  Oleh: 
                  {pub.articles?.article_authors?.map((author: any, i: number) => (
                    <span key={i} className="text-gray-200 bg-[#1a1a2e] px-2 py-0.5 rounded text-sm">
                      {author.full_name}
                    </span>
                  ))}
                </div>
                
                <p className="text-gray-500 mb-6 line-clamp-3">
                  {pub.articles?.abstract}
                </p>

                <div className="flex gap-4">
                  <Link 
                    href={`/article/${pub.articles?.id || '1045'}`} 
                    className="bg-transparent border border-[#c9a84c] text-[#c9a84c] px-6 py-2 rounded-lg font-bold hover:bg-[#c9a84c]/10 transition-colors"
                  >
                    View Details
                  </Link>
                  <button disabled className="bg-gray-800 text-gray-500 px-6 py-2 rounded-lg font-bold cursor-not-allowed">
                    PDF Terkunci
                  </button>
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
