"use client";
import React, { useState } from "react";
import Link from "next/link";

const mockJournals = [
  {
    id: "rjrakp",
    title: "Rumah Jurnal Riset, Analisis dan Keadilan Publik (RJRAKP)",
    issn: "e-ISSN : 2987-1234 | p-ISSN : 2987-5678",
    publisher: "Association of Asia Pacific Academician",
    description: "RJRAKP berfokus pada penelitian multidisiplin, mempromosikan mobilitas akademik, dan menyediakan platform untuk wacana ilmiah kritis di seluruh wilayah Asia Pasifik.",
    impact: "1.25",
    hIndex: "5",
    citations: "142",
    quartile: "Q3",
    subject: "Multidisiplin",
  },
  {
    id: "iaep",
    title: "APASIFIC International Academic Exchange Program Journal (IAEP)",
    issn: "e-ISSN : 2891-9876 | p-ISSN : 2891-5432",
    publisher: "Association of Asia Pacific Academician",
    description: "IAEP menerbitkan artikel tinjauan sejawat berkualitas tinggi yang mencakup pendidikan internasional, program pertukaran akademik, studi lintas budaya, dan kebijakan pendidikan global.",
    impact: "2.10",
    hIndex: "8",
    citations: "310",
    quartile: "Q2",
    subject: "Pendidikan",
  }
];

export default function JournalsRepository() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("Semua");

  const filteredJournals = mockJournals.filter(j => 
    (filter === "Semua" || j.subject === filter) && 
    (j.title.toLowerCase().includes(searchTerm.toLowerCase()) || j.publisher.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="journals-page">
      {/* Hero Search Section */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">Repositori <span className="gold">Jurnal ASIA</span></h1>
          <p className="hero-subtitle">Temukan, baca, dan kutip jurnal ilmiah berdampak tinggi yang terindeks dalam Database Akademik ASIA.</p>
          
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Cari berdasarkan Judul Jurnal, ISSN, atau Penerbit..." 
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
        <div className="container layout-grid">
          
          {/* Sidebar Filters */}
          <aside className="sidebar">
            <div className="filter-widget">
              <h3 className="widget-title">Bidang Ilmu</h3>
              <ul className="filter-list">
                <li>
                  <button className={`filter-item ${filter === "Semua" ? "active" : ""}`} onClick={() => setFilter("Semua")}>
                    Semua Bidang <span className="count">2</span>
                  </button>
                </li>
                <li>
                  <button className={`filter-item ${filter === "Multidisiplin" ? "active" : ""}`} onClick={() => setFilter("Multidisiplin")}>
                    Multidisiplin <span className="count">1</span>
                  </button>
                </li>
                <li>
                  <button className={`filter-item ${filter === "Pendidikan" ? "active" : ""}`} onClick={() => setFilter("Pendidikan")}>
                    Pendidikan <span className="count">1</span>
                  </button>
                </li>
              </ul>
            </div>
            
            <div className="filter-widget mt-6">
              <h3 className="widget-title">Tingkat Kuartil</h3>
              <div className="tier-grid">
                <div className="tier-box">Q1</div>
                <div className="tier-box active">Q2</div>
                <div className="tier-box active">Q3</div>
                <div className="tier-box">Q4</div>
              </div>
            </div>
          </aside>

          {/* Journal List */}
          <main className="journal-list">
            <div className="list-header">
              <div className="results-count">Menampilkan {filteredJournals.length} Jurnal</div>
              <div className="sort-box">
                Urutkan: 
                <select className="sort-select">
                  <option>Faktor Dampak</option>
                  <option>Total Kutipan</option>
                  <option>A-Z</option>
                </select>
              </div>
            </div>

            {filteredJournals.map(journal => (
              <div key={journal.id} className="journal-card">
                <div className="jc-left">
                  <div className="jc-cover">
                    {journal.title.split(" ")[0][0]}
                  </div>
                </div>
                <div className="jc-body">
                  <h2 className="jc-title">{journal.title}</h2>
                  <div className="jc-meta">
                    <span className="publisher">Penerbit: {journal.publisher}</span>
                    <span className="issn">{journal.issn}</span>
                  </div>
                  <p className="jc-desc">{journal.description}</p>
                  
                  <div className="jc-metrics">
                    <div className="metric-pill">
                      <span className="m-label">Dampak</span>
                      <span className="m-value">{journal.impact}</span>
                    </div>
                    <div className="metric-pill">
                      <span className="m-label">Indeks-H</span>
                      <span className="m-value">{journal.hIndex}</span>
                    </div>
                    <div className="metric-pill">
                      <span className="m-label">Kutipan</span>
                      <span className="m-value">{journal.citations}</span>
                    </div>
                    <div className="metric-pill tier">
                      <span className="m-label">Tingkat</span>
                      <span className="m-value">{journal.quartile}</span>
                    </div>
                  </div>
                </div>
                <div className="jc-right">
                  <button className="view-btn" onClick={() => window.location.href = "/journals/rjrakp"}>Lihat Artikel</button>
                  <button className="submit-btn" onClick={() => window.location.href = "/dashboard/submit"}>Kirim Naskah</button>
                </div>
              </div>
            ))}
          </main>
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
          padding: 60px 0;
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
        
        /* Layout */
        .layout-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 40px;
          padding: 40px 20px 80px;
        }
        @media (max-width: 900px) {
          .layout-grid { grid-template-columns: 1fr; }
        }
        
        /* Sidebar */
        .filter-widget {
          background: #111120;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 25px;
        }
        .widget-title {
          font-size: 16px;
          font-weight: 700;
          color: #c9a84c;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .filter-list {
          list-style: none;
          padding: 0; margin: 0;
        }
        .filter-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          background: transparent;
          border: none;
          color: #8888aa;
          padding: 10px 0;
          font-size: 14px;
          cursor: pointer;
          transition: color 0.2s;
          text-align: left;
        }
        .filter-item:hover, .filter-item.active {
          color: #fff;
        }
        .filter-item .count {
          background: rgba(255,255,255,0.05);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
        }
        .filter-item.active .count {
          background: rgba(201,168,76,0.15);
          color: #c9a84c;
        }
        .mt-6 { margin-top: 24px; }
        
        .tier-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .tier-box {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 8px;
          text-align: center;
          padding: 10px;
          font-weight: 700;
          color: #555;
        }
        .tier-box.active {
          background: rgba(201,168,76,0.1);
          border-color: rgba(201,168,76,0.3);
          color: #c9a84c;
        }

        /* List Header */
        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .results-count {
          color: #8888aa;
          font-size: 15px;
        }
        .sort-box {
          color: #8888aa;
          font-size: 14px;
        }
        .sort-select {
          background: #111120;
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          padding: 5px 10px;
          border-radius: 6px;
          margin-left: 10px;
          outline: none;
        }

        /* Journal Card */
        .journal-card {
          background: #111120;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 25px;
          display: flex;
          gap: 25px;
          margin-bottom: 20px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .journal-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.6);
          border-color: rgba(201,168,76,0.2);
        }
        
        .jc-left { flex-shrink: 0; }
        .jc-cover {
          width: 100px;
          height: 140px;
          background: linear-gradient(135deg, #18182e 0%, #111120 100%);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cinzel', serif;
          font-size: 40px;
          font-weight: 900;
          color: #c9a84c;
        }

        .jc-body { flex: 1; }
        .jc-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 10px;
          color: #fff;
          line-height: 1.3;
        }
        .jc-meta {
          font-size: 13px;
          color: #8888aa;
          margin-bottom: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }
        .publisher { color: #c9a84c; font-weight: 600; }
        .issn { border-left: 1px solid rgba(255,255,255,0.1); padding-left: 15px; }
        
        .jc-desc {
          font-size: 14px;
          line-height: 1.6;
          color: #aaa;
          margin-bottom: 20px;
        }

        .jc-metrics {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
        .metric-pill {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 8px 15px;
          display: flex;
          flex-direction: column;
        }
        .metric-pill.tier {
          background: rgba(201,168,76,0.1);
          border-color: rgba(201,168,76,0.3);
        }
        .m-label { font-size: 11px; color: #8888aa; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;}
        .m-value { font-size: 18px; font-weight: 800; color: #fff; }
        .tier .m-value { color: #c9a84c; }

        .jc-right {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 150px;
        }
        .view-btn {
          background: transparent;
          border: 1px solid #c9a84c;
          color: #c9a84c;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .view-btn:hover { background: rgba(201,168,76,0.1); }
        
        .submit-btn {
          background: #c9a84c;
          border: none;
          color: #000;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .submit-btn:hover { background: #b0923d; }

        @media (max-width: 768px) {
          .journal-card { flex-direction: column; }
          .jc-right { flex-direction: row; }
          .view-btn, .submit-btn { flex: 1; }
        }
      `}</style>
    </div>
  );
}
