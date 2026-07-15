"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function JournalsRepository() {
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchJournals() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("journals")
          .select("*")
          .eq("is_active", true);

        if (error) throw error;
        setJournals(data || []);
      } catch (err) {
        console.error("Gagal memuat jurnal:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchJournals();
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
