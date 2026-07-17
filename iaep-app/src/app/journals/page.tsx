"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function JournalsRepository() {
  const [journals, setJournals] = useState<any[]>([]);
  const [globalArticles, setGlobalArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("journals")
          .select("*")
          .eq("is_active", true);

        if (error) throw error;
        setJournals(data || []);

        const { getPublishedArticles } = await import("@/app/actions/editor");
        const res = await getPublishedArticles();
        if (res.success && res.articles) {
          setGlobalArticles(res.articles);
        }
      } catch (err) {
        console.error("Gagal memuat jurnal atau artikel:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredJournals = journals.filter(j => 
    j.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (j.e_issn || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (j.p_issn || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="journals-page">
      {/* Hero Search Section */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">Repositori <span className="gold">Jurnal ASIA</span></h1>
          <p className="hero-subtitle">Temukan, baca, dan kutip jurnal ilmiah resmi yang terdaftar dalam database Akademik ASIA.</p>
          
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Cari berdasarkan Judul Jurnal atau ISSN..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="search-btn">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Cari
            </button>
          </div>
        </div>
      </section>

      {/* Global Articles Section */}
      {!loading && globalArticles.length > 0 && (
        <section className="bg-[#05050a] py-12 border-b border-[#1f1f2e]">
          <div className="container">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h2 className="text-3xl font-bold font-['Cinzel'] text-white">
                  Terbitan <span className="text-[#c9a84c]">Terbaru</span>
                </h2>
                <p className="text-gray-400 mt-2">Kumpulan artikel ilmiah terbaru yang dipublikasikan lintas bidang akademik ASIA.</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {globalArticles.slice(0, 6).map((art, idx) => (
                <div key={idx} className="bg-[#111120] border border-gray-800 rounded-xl p-6 hover:border-[#c9a84c]/50 transition-all flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="text-xs text-[#c9a84c] mb-3 font-bold uppercase tracking-wider px-3 py-1 bg-[#c9a84c]/10 inline-block rounded-full">
                      {art.journals?.name || 'ASIA Journal'}
                    </div>
                    <Link href={`/article/${art.id}`} className="hover:text-[#c9a84c] transition-colors">
                      <h3 className="text-xl text-white font-bold mb-3 line-clamp-2 leading-snug">{art.title}</h3>
                    </Link>
                    <p className="text-sm text-gray-400 line-clamp-3 mb-4 leading-relaxed">
                      {(() => {
                        try {
                          const abs = JSON.parse(art.abstract);
                          return abs.abstract_en || abs.abstract || "";
                        } catch(e) { return art.abstract; }
                      })()}
                    </p>
                  </div>
                  <div className="flex flex-wrap flex-col gap-2 mt-4 pt-4 border-t border-gray-800/50">
                     <div className="text-xs text-gray-500 font-medium">
                        Penulis: {(() => {
                           try {
                             const abs = JSON.parse(art.abstract);
                             return abs.authors?.map((a:any) => a.full_name).join(', ') || "-";
                           } catch(e) { return "-"; }
                        })()}
                     </div>
                    {art.doi && (
                      <a href={art.doi.includes('zenodo.') ? `https://zenodo.org/records/${art.doi.split('zenodo.')[1]}` : `https://doi.org/${art.doi}`}
                         target="_blank" rel="noopener noreferrer"
                         className="text-sm text-emerald-400 hover:text-emerald-300 font-bold mt-1 inline-flex items-center gap-1 transition-colors w-fit">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Baca di Repositori (DOI)
                      </a>
                    )}
                    <Link 
                      href={`/article/${art.id}`} 
                      className="text-sm bg-transparent border border-[#c9a84c] text-[#c9a84c] px-4 py-1.5 rounded font-bold hover:bg-[#c9a84c]/10 transition-colors mt-2 text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <section className="main-content">
        <div className="container">
          {loading ? (
            <div className="text-center py-20 text-[#c9a84c] font-bold animate-pulse text-lg">
              Menghubungkan ke database Repositori Jurnal ASIA...
            </div>
          ) : (
            <div className="journal-list-container">
              <div className="list-header mb-8 flex justify-between items-center">
                <div className="results-count text-gray-400 font-medium">
                  Menampilkan {filteredJournals.length} Jurnal
                </div>
              </div>

              <div className="grid gap-8">
                {filteredJournals.map(journal => (
                  <div key={journal.id} className="journal-card">
                    <div className="jc-left">
                      <div className="jc-cover">
                        {journal.name.charAt(0)}
                      </div>
                    </div>
                    <div className="jc-body">
                      <h2 className="jc-title">{journal.name}</h2>
                      <div className="jc-meta flex flex-wrap gap-4 mt-2 mb-4 text-sm text-gray-400">
                        <span className="publisher font-bold text-gray-300">Penerbit: Association of Asia Pacific Academician</span>
                        {journal.e_issn && <span className="issn bg-zinc-900 px-2 py-0.5 rounded text-gray-400 border border-zinc-800">{journal.e_issn}</span>}
                        {journal.p_issn && <span className="issn bg-zinc-900 px-2 py-0.5 rounded text-gray-400 border border-zinc-800">{journal.p_issn}</span>}
                      </div>
                      <p className="jc-desc text-gray-400 leading-relaxed text-justify">
                        {journal.description || "Jurnal resmi terbitan Association of Asia Pacific Academician yang menerbitkan artikel ilmiah hasil peninjauan sejawat (peer-review) berkualitas tinggi di bidang sains dan akademik."}
                      </p>
                    </div>
                    <div className="jc-right flex flex-col gap-3 justify-center">
                      <button className="view-btn" onClick={() => window.location.href = `/journals/${journal.slug}`}>Lihat Artikel</button>
                      <button className="submit-btn" onClick={() => window.location.href = "/dashboard/submit"}>Kirim Naskah</button>
                    </div>
                  </div>
                ))}

                {filteredJournals.length === 0 && (
                  <div className="text-center py-20 text-gray-500 bg-[#111120] border border-gray-800 rounded-2xl">
                    Tidak ada jurnal yang sesuai dengan pencarian Anda.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .journals-page {
          min-height: 100vh;
          background: #05050a;
          color: #fff;
          font-family: 'Inter', sans-serif;
          padding-top: 100px;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .gold { color: #c9a84c; }
        
        /* Hero */
        .hero-section {
          background: linear-gradient(180deg, #111120 0%, #05050a 100%);
          padding: 60px 0 40px;
          text-align: center;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .hero-title {
          font-size: 42px;
          font-weight: 800;
          font-family: 'Cinzel', serif;
          margin-bottom: 15px;
        }
        .hero-subtitle {
          color: #8888aa;
          font-size: 16px;
          max-width: 600px;
          margin: 0 auto 40px;
        }
        .search-box {
          display: flex;
          max-width: 700px;
          margin: 0 auto;
          background: #111120;
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 50px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 20px 30px;
          color: #fff;
          font-size: 16px;
          outline: none;
        }
        .search-btn {
          background: #c9a84c;
          color: #000;
          border: none;
          padding: 0 35px;
          font-weight: 700;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .search-btn:hover { background: #b0923d; }
        
        /* Main Content */
        .main-content {
          padding: 40px 0 80px;
        }
        
        /* Journal Card */
        .journal-card {
          background: #111120;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 30px;
          display: flex;
          gap: 30px;
          transition: transform 0.3s, border-color 0.3s;
        }
        .journal-card:hover {
          transform: translateY(-5px);
          border-color: rgba(201,168,76,0.3);
        }
        
        .jc-left {
          flex-shrink: 0;
        }
        .jc-cover {
          width: 80px;
          height: 100px;
          background: linear-gradient(135deg, #1b1b3a 0%, #0d0d1a 100%);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          font-weight: 700;
          color: #c9a84c;
          font-family: 'Cinzel', serif;
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        
        .jc-body {
          flex: 1;
        }
        .jc-title {
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          font-family: 'Cinzel', serif;
        }
        .jc-meta {
          margin-bottom: 15px;
        }
        .jc-desc {
          color: #a0a0ba;
          font-size: 15px;
          line-height: 1.6;
        }
        
        .jc-right {
          flex-shrink: 0;
          width: 180px;
        }
        .view-btn, .submit-btn {
          width: 100%;
          padding: 12px 0;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }
        .view-btn {
          background: #c9a84c;
          color: #000;
          border: none;
        }
        .view-btn:hover { background: #b0923d; }
        
        .submit-btn {
          background: transparent;
          color: #c9a84c;
          border: 1px solid #c9a84c;
        }
        .submit-btn:hover {
          background: rgba(201,168,76,0.1);
        }
        
        @media (max-width: 768px) {
          .journal-card {
            flex-direction: column;
            gap: 20px;
            padding: 20px;
          }
          .jc-right {
            width: 100%;
            flex-direction: row;
          }
          .jc-cover {
            width: 60px;
            height: 80px;
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
}
