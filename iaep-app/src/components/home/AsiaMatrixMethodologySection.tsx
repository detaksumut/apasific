'use client';

import React, { useState } from 'react';

type TabKey = 'all' | 'aas' | 'acs' | 'asjr' | 'aif' | 'ai' | 'quartile';

export default function AsiaMatrixMethodologySection() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const tabs: Array<{ key: TabKey; label: string; num: string; badge: string }> = [
    { key: 'all', label: 'All Specifications', num: '00', badge: 'Complete View' },
    { key: 'aas', label: 'AAS (Article Score)', num: '01', badge: 'Article Level' },
    { key: 'acs', label: 'ACS (CiteScore)', num: '02', badge: '4-Year Impact' },
    { key: 'asjr', label: 'ASJR (Prestige SJR)', num: '03', badge: 'Graph Prestige' },
    { key: 'aif', label: 'AIF (Impact Factor)', num: '04', badge: '2-Year Rate' },
    { key: 'ai', label: 'ASIA INDEX (AI)', num: '05', badge: 'Composite Index' },
    { key: 'quartile', label: 'Percentile & Quartiles', num: '06', badge: 'Quartiles' },
  ];

  return (
    <div className="w-full my-10 bg-[#070812] border border-[#c9a84c]/30 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden text-gray-200 font-sans" data-aos="fade-up">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#c9a84c]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Panel */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-800/80 pb-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-[#c9a84c]/15 text-[#e8c97a] border border-[#c9a84c]/30">
              ASIA MATRIX SPECIFICATION v1.2
            </span>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Mathematical Specification &amp; Governance
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide mt-2 font-serif">
            ASIA MATRIX &mdash; <span className="text-[#c9a84c]">Formula &amp; Methodology</span>
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-3xl">
            Transparansi resmi sistem metrik ilmiah, formulasi matematis berbobot prestise graf, komposit ASIA Index, dan pemeringkatan kuartil akademik.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#101222] px-3.5 py-2 rounded-xl border border-gray-800 text-[11px] text-gray-300 font-mono flex-shrink-0">
          <span className="text-[#c9a84c]">●</span>
          <span>Canonical Reference</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-4 border-b border-gray-800/60 no-scrollbar relative z-10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                isActive
                  ? 'text-[#c9a84c] border-[#c9a84c]/60 bg-[#c9a84c]/15 shadow-lg font-black scale-[1.02]'
                  : 'bg-[#101222]/80 text-gray-400 border-gray-800 hover:text-white hover:bg-[#181b30]'
              }`}
            >
              <span className="font-mono text-[10px] text-[#c9a84c] opacity-80">{tab.num}.</span>
              <span>{tab.label}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider ${
                isActive ? 'bg-black/40 text-white font-mono' : 'bg-gray-800/80 text-gray-400'
              }`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Modules */}
      <div className="pt-6 space-y-10 relative z-10">

        {/* ══════════════════════════════════════════════════════════
            01. AAS — ASIA ARTICLE SCORE
        ══════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'aas') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 border-l-4 border-purple-500 pl-3">
              <div>
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-widest">MODULE 01 &bull; ARTICLE LEVEL</span>
                <h4 className="text-base sm:text-lg font-bold text-white">01. AAS &mdash; ASIA Article Score</h4>
              </div>
              <span className="text-[11px] font-mono text-purple-300 bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/30">
                Bounded: <strong>0.00 &ndash; 100.00</strong>
              </span>
            </div>

            {/* Main Formula Card */}
            <div className="bg-[#0b0d1b] border border-purple-500/30 rounded-2xl p-5 font-mono text-center shadow-inner">
              <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 font-sans font-bold">Main Formula</div>
              <div className="text-sm sm:text-base md:text-lg font-bold text-white tracking-wide">
                AAS<sub>a</sub> = min(100.00, max(0.00, (C<sub>prov</sub> + C<sub>cit</sub> + C<sub>vel</sub> + C<sub>net</sub>) &times; &lambda;(t)))
              </div>
            </div>

            {/* 4 Component Formula Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Cprov */}
              <div className="bg-[#0c0e1e] border border-gray-800 hover:border-purple-500/40 transition-colors rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">C<sub>prov</sub> (Provenance)</span>
                  <span className="font-mono text-[#c9a84c] text-xs font-bold">Max 40 Pts</span>
                </div>
                <div className="bg-[#121528] p-2.5 rounded-lg border border-gray-800 text-center font-mono text-xs text-purple-200">
                  C<sub>prov</sub> = 40.0 &times; (PS<sub>a</sub> / 100)
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                  Verifikasi identitas kanonikal (Crossref DOI, Zenodo, OpenAIRE, ORCID, GS) pada rentang skor 0&ndash;100.
                </p>
              </div>

              {/* Ccit */}
              <div className="bg-[#0c0e1e] border border-gray-800 hover:border-purple-500/40 transition-colors rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">C<sub>cit</sub> (Prestige Citation)</span>
                  <span className="font-mono text-[#c9a84c] text-xs font-bold">Max 35 Pts</span>
                </div>
                <div className="bg-[#121528] p-2.5 rounded-lg border border-gray-800 text-center font-mono text-xs text-purple-200">
                  C<sub>cit</sub> = 35.0 &times; min(1, ln(1 + C<sub>a</sub><sup>weighted</sup>) / ln(1 + 50.0))
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                  Normalisasi logaritmik sitasi berbobot prestise graf dengan plafon saturasi 50 poin sitasi efektif.
                </p>
              </div>

              {/* Cvel */}
              <div className="bg-[#0c0e1e] border border-gray-800 hover:border-purple-500/40 transition-colors rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">C<sub>vel</sub> (Citation Velocity)</span>
                  <span className="font-mono text-[#c9a84c] text-xs font-bold">Max 15 Pts</span>
                </div>
                <div className="bg-[#121528] p-2.5 rounded-lg border border-gray-800 text-center font-mono text-xs text-purple-200">
                  C<sub>vel</sub> = 15.0 &times; min(1, (Total Citations / &Delta;t) / 5.0)
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                  Laju akumulasi sitasi tahunan naskah dengan target saturasi 5.0 sitasi/tahun.
                </p>
              </div>

              {/* Cnet */}
              <div className="bg-[#0c0e1e] border border-gray-800 hover:border-purple-500/40 transition-colors rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">C<sub>net</sub> (Scholarly Network)</span>
                  <span className="font-mono text-[#c9a84c] text-xs font-bold">Max 10 Pts</span>
                </div>
                <div className="bg-[#121528] p-2.5 rounded-lg border border-gray-800 text-center font-mono text-xs text-purple-200">
                  C<sub>net</sub> = 10.0 &times; (0.6 &times; Diversitas + 0.4 &times; Link ORCID)
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                  Keragaman jurnal pengutip eksternal (60%) dan keterikatan jaringan identitas ilmiah penulis (40%).
                </p>
              </div>
            </div>

            {/* Time Factor */}
            <div className="bg-[#101222] border border-gray-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#c9a84c] font-bold">&lambda;(t) Faktor Kontinuitas Waktu:</span>
                <code className="text-gray-300 font-mono">max(0.85, 1 / (1 + 0.02 &times; &Delta;t<sub>years</sub>))</code>
              </div>
              <span className="font-mono text-emerald-400 font-bold">0.85 &le; &lambda;(t) &le; 1.00</span>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            02. ACS — ASIA CITESCORE
        ══════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'acs') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 border-l-4 border-blue-500 pl-3">
              <div>
                <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-widest">MODULE 02 &bull; JOURNAL RATE</span>
                <h4 className="text-base sm:text-lg font-bold text-white">02. ACS &mdash; ASIA CiteScore</h4>
              </div>
              <span className="text-[11px] font-mono text-blue-300 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/30">
                Window: <strong>4 Years</strong>
              </span>
            </div>

            {/* Large Formula Card */}
            <div className="bg-[#0b0d1b] border border-blue-500/30 rounded-2xl p-5 sm:p-6 shadow-inner space-y-4">
              <div className="text-[10px] text-gray-400 uppercase tracking-widest text-center font-sans font-bold">
                4-Year Cumulative Citation Impact Formula
              </div>

              {/* Math Fraction Display */}
              <div className="flex items-center justify-center font-mono text-white text-sm sm:text-base md:text-lg">
                <span className="font-bold text-blue-300 mr-3">ACS<sub>y</sub> =</span>
                <div className="inline-flex flex-col items-center">
                  <span className="border-b border-gray-600 px-3 pb-1 text-center font-bold">
                    C<sub>y-3</sub> + C<sub>y-2</sub> + C<sub>y-1</sub> + C<sub>y</sub>
                  </span>
                  <span className="pt-1 text-center text-gray-300 font-bold">
                    P<sub>y-3</sub> + P<sub>y-2</sub> + P<sub>y-1</sub> + P<sub>y</sub>
                  </span>
                </div>
              </div>

              {/* Inside parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-gray-800 text-[11px] font-mono">
                <div className="bg-[#101326] p-2.5 rounded-lg border border-gray-800 text-center">
                  <span className="text-gray-400 block text-[10px]">CITATION WINDOW</span>
                  <span className="text-white font-bold">4 Years</span>
                </div>
                <div className="bg-[#101326] p-2.5 rounded-lg border border-gray-800 text-center">
                  <span className="text-gray-400 block text-[10px]">NUMERATOR</span>
                  <span className="text-white font-bold">&sum; Citations (4-Yr)</span>
                </div>
                <div className="bg-[#101326] p-2.5 rounded-lg border border-gray-800 text-center">
                  <span className="text-gray-400 block text-[10px]">DENOMINATOR</span>
                  <span className="text-white font-bold">&sum; Publications (4-Yr)</span>
                </div>
                <div className="bg-[#101326] p-2.5 rounded-lg border border-gray-800 text-center">
                  <span className="text-gray-400 block text-[10px]">OUTPUT SCALE</span>
                  <span className="text-emerald-400 font-bold">0.00+</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 italic text-center font-serif pt-1">
                ASIA CiteScore measures the four-year citation impact of eligible scholarly publications within the ASIA scholarly ecosystem.
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            03. ASJR — ASIA SJR (PRESTIGE-WEIGHTED METRIC)
        ══════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'asjr') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 border-l-4 border-[#c9a84c] pl-3">
              <div>
                <span className="text-[10px] font-mono text-[#c9a84c] font-bold uppercase tracking-widest">MODULE 03 &bull; PRESTIGE GRAPH RANK</span>
                <h4 className="text-base sm:text-lg font-bold text-white">03. ASJR &mdash; ASIA SJR</h4>
              </div>
              <span className="text-[11px] font-mono text-[#e8c97a] bg-[#c9a84c]/10 px-3 py-1 rounded-lg border border-[#c9a84c]/30">
                Prestige Propagation Metric
              </span>
            </div>

            {/* Formula Card */}
            <div className="bg-[#0b0d1b] border border-[#c9a84c]/40 rounded-2xl p-5 sm:p-6 shadow-inner space-y-4">
              <div className="text-[10px] text-gray-400 uppercase tracking-widest text-center font-sans font-bold">
                Prestige-Weighted Scholarly Graph Citation Transfer
              </div>

              {/* Math Display */}
              <div className="flex items-center justify-center font-mono text-white text-sm sm:text-base md:text-lg">
                <span className="font-bold text-[#e8c97a] mr-3">ASJR<sub>i</sub> =</span>
                <span className="text-xl text-[#c9a84c] mr-2">&sum;<sub>j</sub></span>
                <div className="inline-flex items-center bg-[#121528] px-4 py-2 rounded-xl border border-[#c9a84c]/30">
                  <span className="text-gray-300">(</span>
                  <div className="inline-flex flex-col items-center mx-1.5">
                    <span className="border-b border-gray-600 px-2 pb-0.5 text-xs text-[#e8c97a] font-bold">ASJR<sub>j</sub></span>
                    <span className="pt-0.5 text-xs text-gray-300 font-bold">O<sub>j</sub></span>
                  </div>
                  <span className="text-gray-400 mx-1.5">&times;</span>
                  <span className="text-cyan-300 text-xs font-bold">C<sub>ji</sub></span>
                  <span className="text-gray-400 mx-1.5">&times;</span>
                  <span className="text-purple-300 text-xs font-bold">W<sub>ij</sub></span>
                  <span className="text-gray-300">)</span>
                </div>
              </div>

              {/* Parameter Table Breakdown */}
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px]">
                      <th className="pb-2 font-bold w-24">Parameter</th>
                      <th className="pb-2 font-bold font-sans">Meaning / Academic Interpretation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-sans">
                    <tr>
                      <td className="py-2.5 font-mono text-[#c9a84c] font-bold">ASJR<sub>i</sub></td>
                      <td className="py-2.5 text-gray-300">Prestige score of target journal <em>i</em>.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-mono text-purple-300 font-bold">ASJR<sub>j</sub></td>
                      <td className="py-2.5 text-gray-300">Prestige of citing journal <em>j</em>.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-mono text-blue-300 font-bold">O<sub>j</sub></td>
                      <td className="py-2.5 text-gray-300">Total outgoing citations from journal <em>j</em>.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-mono text-cyan-300 font-bold">C<sub>ji</sub></td>
                      <td className="py-2.5 text-gray-300">Direct citation volume transferred from journal <em>j</em> &rarr; <em>i</em>.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-mono text-emerald-400 font-bold">W<sub>ij</sub></td>
                      <td className="py-2.5 text-gray-300">Subject normalization and topology confidence weight (<code className="text-gray-400 font-mono text-xs">W_damp &times; W_conf</code>).</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-[#121528] border border-gray-800 p-3 rounded-xl text-xs text-gray-400 font-sans">
                <strong className="text-white">Prinsip Utama:</strong> Sitasi dari jurnal berprestise tinggi mentransmisikan bobot yang jauh lebih besar daripada jumlah sitasi mentah, mencegah manipulasi sitasi sirkular atau jurnal predator.
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            04. AIF — ASIA IMPACT FACTOR
        ═══════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'aif') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 border-l-4 border-cyan-500 pl-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">MODULE 04 &bull; JOURNAL RATE</span>
                <h4 className="text-base sm:text-lg font-bold text-white">04. AIF &mdash; ASIA Impact Factor</h4>
              </div>
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/30">
                Window: <strong>2 Years</strong>
              </span>
            </div>

            {/* Formula Box */}
            <div className="bg-[#0b0d1b] border border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-inner space-y-4">
              <div className="text-[10px] text-gray-400 uppercase tracking-widest text-center font-sans font-bold">
                2-Year Short-Term Citation Frequency Rate
              </div>

              {/* Math Display */}
              <div className="flex items-center justify-center font-mono text-white text-sm sm:text-base md:text-lg">
                <span className="font-bold text-cyan-300 mr-3">AIF<sub>y</sub> =</span>
                <div className="inline-flex flex-col items-center">
                  <span className="border-b border-gray-600 px-3 pb-1 text-center font-bold text-cyan-200">
                    C<sub>y</sub> (P<sub>y-1</sub>, P<sub>y-2</sub>)
                  </span>
                  <span className="pt-1 text-center text-gray-300 font-bold">
                    N (P<sub>y-1</sub>, P<sub>y-2</sub>)
                  </span>
                </div>
              </div>

              {/* Parameter Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs font-mono">
                <div className="bg-[#101326] p-3 rounded-xl border border-gray-800">
                  <span className="text-gray-400 block text-[10px]">CITATION YEAR</span>
                  <span className="text-white font-bold">Year Y</span>
                </div>
                <div className="bg-[#101326] p-3 rounded-xl border border-gray-800">
                  <span className="text-gray-400 block text-[10px]">PUB WINDOW</span>
                  <span className="text-white font-bold">Y&minus;1, Y&minus;2</span>
                </div>
                <div className="bg-[#101326] p-3 rounded-xl border border-gray-800">
                  <span className="text-gray-400 block text-[10px]">NUMERATOR</span>
                  <span className="text-cyan-300 font-bold">Sitasi Thn Y ke [Y-1, Y-2]</span>
                </div>
                <div className="bg-[#101326] p-3 rounded-xl border border-gray-800">
                  <span className="text-gray-400 block text-[10px]">DENOMINATOR</span>
                  <span className="text-gray-300 font-bold">Artikel Terbit [Y-1, Y-2]</span>
                </div>
              </div>

              {/* Concrete Example Box */}
              <div className="bg-[#10152a] border border-cyan-500/40 rounded-xl p-4 font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-center sm:text-left">
                  <span className="text-[10px] text-cyan-400 uppercase font-sans font-bold block">Worked Example Calculation</span>
                  <span className="text-gray-300 font-sans">
                    Sitasi 2026: 40 (ke 2025) + 50 (ke 2024) = 90 &bull; Naskah: 20 (2025) + 30 (2024) = 50
                  </span>
                </div>
                <div className="bg-[#0c0e1e] px-4 py-2 rounded-lg border border-cyan-500/30 font-bold text-white text-sm whitespace-nowrap">
                  AIF<sub>2026</sub> = (40 + 50) / (20 + 30) = <span className="text-cyan-400">1.80</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            05. AI — ASIA INDEX (COMPOSITE INDEX)
        ══════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'ai') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 border-l-4 border-amber-500 pl-3">
              <div>
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest">MODULE 05 &bull; COMPOSITE INDEX</span>
                <h4 className="text-base sm:text-lg font-bold text-white">05. AI &mdash; ASIA INDEX</h4>
              </div>
              <span className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">
                Flagship Composite Metric
              </span>
            </div>

            {/* Grand Composite Formula Box */}
            <div className="bg-[#0b0d1b] border border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-inner space-y-5">
              <div className="text-[10px] text-gray-400 uppercase tracking-widest text-center font-sans font-bold">
                Multi-Dimensional Weighted Academic Impact Index
              </div>

              {/* Master Formula Display */}
              <div className="bg-[#101326] p-4 rounded-xl border border-amber-500/30 text-center font-mono space-y-1">
                <div className="text-xs sm:text-sm text-gray-400">
                  AI = W<sub>C</sub>(CS<sub>N</sub>) + W<sub>S</sub>(SJR<sub>N</sub>) + W<sub>I</sub>(AIF<sub>N</sub>) + W<sub>Q</sub>(Q<sub>N</sub>) + W<sub>T</sub>(T<sub>N</sub>)
                </div>
                <div className="text-sm sm:text-base md:text-lg font-bold text-amber-300">
                  AI = 0.30(ACS<sub>N</sub>) + 0.25(ASJR<sub>N</sub>) + 0.20(AIF<sub>N</sub>) + 0.15(Q<sub>N</sub>) + 0.10(T<sub>N</sub>)
                </div>
              </div>

              {/* 5 Weight Mini Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono text-center">
                <div className="bg-[#12162d] border border-blue-500/30 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase block font-sans">CiteScore (ACS)</span>
                  <div className="text-lg font-black text-blue-400">30%</div>
                  <span className="text-[10px] text-gray-400 block">W<sub>C</sub> = 0.30</span>
                </div>

                <div className="bg-[#12162d] border border-[#c9a84c]/30 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase block font-sans">ASIA-SJR (ASJR)</span>
                  <div className="text-lg font-black text-[#e8c97a]">25%</div>
                  <span className="text-[10px] text-gray-400 block">W<sub>S</sub> = 0.25</span>
                </div>

                <div className="bg-[#12162d] border border-cyan-500/30 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase block font-sans">ASIA IF (AIF)</span>
                  <div className="text-lg font-black text-cyan-400">20%</div>
                  <span className="text-[10px] text-gray-400 block">W<sub>I</sub> = 0.20</span>
                </div>

                <div className="bg-[#12162d] border border-purple-500/30 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase block font-sans">Quality (Q)</span>
                  <div className="text-lg font-black text-purple-400">15%</div>
                  <span className="text-[10px] text-gray-400 block">W<sub>Q</sub> = 0.15</span>
                </div>

                <div className="bg-[#12162d] border border-emerald-500/30 rounded-xl p-3.5 space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-gray-400 uppercase block font-sans">Transparency (T)</span>
                  <div className="text-lg font-black text-emerald-400">10%</div>
                  <span className="text-[10px] text-gray-400 block">W<sub>T</sub> = 0.10</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            06. PERCENTILE & ASIA QUARTILE (AM-Q1 .. AM-Q4)
        ══════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'quartile') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 border-l-4 border-emerald-500 pl-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">MODULE 06 &bull; RELATIVE RANKING</span>
                <h4 className="text-base sm:text-lg font-bold text-white">06. Percentile &amp; ASIA Quartile</h4>
              </div>
              <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30">
                Minimum Corpus: <strong>N &ge; 10</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Percentile Formula Card */}
              <div className="bg-[#0b0d1b] border border-emerald-500/30 rounded-2xl p-5 shadow-inner space-y-3 font-mono">
                <span className="text-[10px] text-gray-400 uppercase font-sans font-bold block">
                  Relative Subject Percentile Formula
                </span>
                <div className="bg-[#101326] p-4 rounded-xl border border-gray-800 text-center text-sm sm:text-base font-bold text-emerald-300">
                  Percentile<sub>i</sub> = 100 &times; (N<sub>below</sub>(AI<sub>i</sub>) / (N<sub>total</sub> &minus; 1))
                </div>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  Menghitung proporsi jurnal dalam kategori subjek yang memiliki skor ASIA Index (AI) di bawah jurnal <em>i</em>.
                </p>
              </div>

              {/* Quartile Threshold Card */}
              <div className="bg-[#0b0d1b] border border-emerald-500/30 rounded-2xl p-5 shadow-inner space-y-3 font-mono">
                <span className="text-[10px] text-gray-400 uppercase font-sans font-bold block">
                  Quartile Threshold Function
                </span>
                <div className="bg-[#101326] p-3 rounded-xl border border-gray-800 text-xs text-gray-300 space-y-1">
                  <div className="flex justify-between items-center text-emerald-400 font-bold">
                    <span>Q1 (Top 25%)</span>
                    <span>Percentile &ge; 75.00%</span>
                  </div>
                  <div className="flex justify-between items-center text-blue-400 font-bold">
                    <span>Q2 (Upper-Mid)</span>
                    <span>50.00% &le; Percentile &lt; 75.00%</span>
                  </div>
                  <div className="flex justify-between items-center text-amber-400 font-bold">
                    <span>Q3 (Lower-Mid)</span>
                    <span>25.00% &le; Percentile &lt; 50.00%</span>
                  </div>
                  <div className="flex justify-between items-center text-red-400 font-bold">
                    <span>Q4 (Bottom 25%)</span>
                    <span>Percentile &lt; 25.00%</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  Jika <code className="text-amber-300 font-mono">N &lt; 10</code>, nilai kuartil menjadi <code className="text-amber-300 font-mono">N/A</code> dan berstatus <code className="text-amber-300 font-mono">PROVISIONAL</code>.
                </p>
              </div>
            </div>

            {/* 4 Quartile Visual Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-[#0c0e1e] border border-emerald-500/40 rounded-xl p-3.5 text-center space-y-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-block">AM-Q1</span>
                <div className="text-xs text-white font-bold">&ge; 75.00%</div>
                <div className="text-[10px] text-gray-400 font-sans">Kuartil 1 Teratas</div>
              </div>

              <div className="bg-[#0c0e1e] border border-blue-500/40 rounded-xl p-3.5 text-center space-y-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30 inline-block">AM-Q2</span>
                <div className="text-xs text-white font-bold">50.00% &ndash; 74.99%</div>
                <div className="text-[10px] text-gray-400 font-sans">Kuartil 2 Menengah</div>
              </div>

              <div className="bg-[#0c0e1e] border border-amber-500/40 rounded-xl p-3.5 text-center space-y-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 inline-block">AM-Q3</span>
                <div className="text-xs text-white font-bold">25.00% &ndash; 49.99%</div>
                <div className="text-[10px] text-gray-400 font-sans">Kuartil 3 Menengah</div>
              </div>

              <div className="bg-[#0c0e1e] border border-red-500/40 rounded-xl p-3.5 text-center space-y-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-black bg-red-500/20 text-red-400 border border-red-500/30 inline-block">AM-Q4</span>
                <div className="text-xs text-white font-bold">&lt; 25.00%</div>
                <div className="text-[10px] text-gray-400 font-sans">Kuartil 4 Bawah</div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer Statement */}
      <div className="border-t border-gray-800/80 pt-4 mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-400 text-xs relative z-10">
        <p className="leading-relaxed text-center sm:text-left font-serif italic text-gray-400">
          Metrik akademik ASIA didefinisikan secara mandiri oleh APASIFIC untuk transparansi dan akuntabilitas ilmiah Asia-Pasifik.
        </p>
        <span className="px-3 py-1 rounded-full bg-[#101222] border border-[#c9a84c]/30 text-[#c9a84c] font-mono text-[10px] font-bold tracking-widest flex-shrink-0">
          METHODOLOGY-SPEC-v1.2
        </span>
      </div>
    </div>
  );
}
