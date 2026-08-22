"use client";

import React from 'react';

export default function AsiaMetricsSidebarCard() {
  return (
    <div className="bg-[#0e101f] border border-[#c9a84c]/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6 text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#c9a84c]/15 via-transparent to-transparent pointer-events-none rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-cyan-500/10 via-transparent to-transparent pointer-events-none rounded-tr-full" />

      {/* Header */}
      <div className="border-b border-gray-800 pb-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#181a33] border border-[#c9a84c]/30 text-[#c9a84c] text-[11px] font-bold uppercase tracking-wider mb-2">
          <span className="w-2 h-2 rounded-full bg-[#c9a84c] animate-pulse" />
          ASIA MATRIX MATHEMATICAL SPECIFICATION
        </div>
        <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
          Formula &amp; Metodologi Metrik Ilmiah
        </h3>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
          Spesifikasi perhitungan metrik kanonikal artikel, jurnal, dan penentuan Quartile ASIA Index.
        </p>
      </div>

      {/* 01. AAS — ASIA ARTICLE SCORE */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wide">
            01. AAS — ASIA Article Score
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            Article Level
          </span>
        </div>

        {/* Main AAS Box */}
        <div className="bg-[#14172e] border border-emerald-500/30 rounded-2xl p-3.5 space-y-2">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center border-b border-gray-800 pb-1">
            Main Composite Formula
          </div>
          <div className="py-1 text-center font-mono font-bold text-xs sm:text-sm text-emerald-300 tracking-wide overflow-x-auto">
            AAS<sub>a</sub> = min(100.00, max(0.00, (C<sub>prov</sub> + C<sub>cit</sub> + C<sub>vel</sub> + C<sub>net</sub>) × λ(t)))
          </div>
        </div>

        {/* AAS Sub-components */}
        <div className="grid grid-cols-1 gap-2 text-xs font-mono">
          <div className="bg-[#121428] border border-gray-800 rounded-xl p-2.5">
            <div className="flex justify-between text-[11px] text-[#c9a84c] font-bold mb-1 font-sans">
              <span>C<sub>prov</sub> (Provenance)</span>
              <span className="text-gray-400 font-normal">Max 40 Pts</span>
            </div>
            <div className="text-gray-200 font-bold text-center">
              C<sub>prov</sub> = 40.0 × (PS<sub>a</sub> / 100)
            </div>
          </div>

          <div className="bg-[#121428] border border-gray-800 rounded-xl p-2.5">
            <div className="flex justify-between text-[11px] text-cyan-400 font-bold mb-1 font-sans">
              <span>C<sub>cit</sub> (Prestige Citation)</span>
              <span className="text-gray-400 font-normal">Max 35 Pts</span>
            </div>
            <div className="text-gray-200 font-bold text-center">
              C<sub>cit</sub> = 35.0 × min(1, ln(1 + C<sub>a</sub><sup>weighted</sup>) / ln(1 + 50.0))
            </div>
          </div>
        </div>
      </div>

      {/* 02. ACS — ASIA CITESCORE */}
      <div className="space-y-3 relative z-10 pt-2 border-t border-gray-850">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-blue-400 uppercase tracking-wide">
            02. ACS — ASIA CiteScore
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
            4-Year Window
          </span>
        </div>

        <div className="bg-[#14172e] border border-blue-500/30 rounded-2xl p-4 text-center space-y-2">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-1">
            4-Year Cumulative Citation Impact Formula
          </div>
          <div className="py-2 flex items-center justify-center font-mono font-bold text-sm sm:text-base text-cyan-300">
            <span className="mr-2.5">ACS<sub>y</sub> =</span>
            <div className="inline-flex flex-col items-center">
              <span className="border-b-2 border-cyan-400/80 px-2 pb-1 text-xs sm:text-sm text-cyan-200">
                C<sub>y-3</sub> + C<sub>y-2</sub> + C<sub>y-1</sub> + C<sub>y</sub>
              </span>
              <span className="pt-1 text-xs sm:text-sm text-cyan-200">
                P<sub>y-3</sub> + P<sub>y-2</sub> + P<sub>y-1</sub> + P<sub>y</sub>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 03. ASJR — ASIA SJR */}
      <div className="space-y-3 relative z-10 pt-2 border-t border-gray-850">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wide">
            03. ASJR — ASIA SJR
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
            Graph Network
          </span>
        </div>

        <div className="bg-[#14172e] border border-amber-500/30 rounded-2xl p-4 text-center space-y-2">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-1">
            Prestige-Weighted Graph Citation Transfer
          </div>
          <div className="py-2 flex items-center justify-center font-mono font-bold text-sm sm:text-base text-amber-300">
            <span className="mr-2">ASJR<sub>i</sub> = ∑<sub>j</sub></span>
            <span className="text-gray-300 text-lg mr-1">(</span>
            <div className="inline-flex flex-col items-center">
              <span className="border-b border-amber-400 px-1 text-xs sm:text-sm text-amber-200">
                ASJR<sub>j</sub>
              </span>
              <span className="text-xs sm:text-sm text-amber-200">
                O<sub>j</sub>
              </span>
            </div>
            <span className="mx-1.5 text-cyan-300">× C<sub>ji</sub> × W<sub>ij</sub></span>
            <span className="text-gray-300 text-lg ml-1">)</span>
          </div>
        </div>
      </div>

      {/* 04. AIF — ASIA IMPACT FACTOR */}
      <div className="space-y-3 relative z-10 pt-2 border-t border-gray-850">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-purple-400 uppercase tracking-wide">
            04. AIF — ASIA Impact Factor
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
            2-Year Window
          </span>
        </div>

        <div className="bg-[#14172e] border border-purple-500/30 rounded-2xl p-4 text-center space-y-2">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-1">
            2-Year Direct Citation Impact Formula
          </div>
          <div className="py-2 flex items-center justify-center font-mono font-bold text-sm sm:text-base text-purple-300">
            <span className="mr-2.5">AIF<sub>y</sub> =</span>
            <div className="inline-flex flex-col items-center">
              <span className="border-b-2 border-purple-400/80 px-2 pb-1 text-xs sm:text-sm text-purple-200">
                C<sub>y-1</sub> + C<sub>y-2</sub>
              </span>
              <span className="pt-1 text-xs sm:text-sm text-purple-200">
                P<sub>y-1</sub> + P<sub>y-2</sub>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 05. AI — ASIA INDEX */}
      <div className="space-y-3 relative z-10 pt-2 border-t border-gray-850">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-[#facc15] uppercase tracking-wide">
            05. AI — ASIA INDEX
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
            Composite Metric
          </span>
        </div>

        <div className="bg-[#14172e] border border-yellow-500/30 rounded-2xl p-4 text-center space-y-2.5">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-1">
            Multi-Dimensional Weighted Academic Impact Index
          </div>
          <div className="font-mono text-xs sm:text-sm text-blue-300 font-semibold tracking-tight">
            AI = W<sub>C</sub>(CS<sub>N</sub>) + W<sub>S</sub>(SJR<sub>N</sub>) + W<sub>I</sub>(AIF<sub>N</sub>) + W<sub>Q</sub>(Q<sub>N</sub>) + W<sub>T</sub>(T<sub>N</sub>)
          </div>
          <div className="bg-[#0b0d1b] border border-yellow-500/40 rounded-xl py-2 px-2 font-mono font-extrabold text-xs sm:text-sm text-[#facc15] tracking-tight">
            AI = 0.30(ACS<sub>N</sub>) + 0.25(ASJR<sub>N</sub>) + 0.20(AIF<sub>N</sub>) + 0.15(Q<sub>N</sub>) + 0.10(T<sub>N</sub>)
          </div>
        </div>
      </div>

      {/* 06. PERCENTILE & ASIA QUARTILE */}
      <div className="space-y-3 relative z-10 pt-2 border-t border-gray-850">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-rose-400 uppercase tracking-wide">
            06. Percentile &amp; ASIA Quartile
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
            Tier Categorization
          </span>
        </div>

        {/* Percentile Formula */}
        <div className="bg-[#14172e] border border-rose-500/30 rounded-2xl p-4 text-center space-y-2">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-1">
            Percentile Rank Formula
          </div>
          <div className="py-2 flex items-center justify-center font-mono font-bold text-sm sm:text-base text-white">
            <span className="mr-2 italic text-rose-300">Percentile<sub>i</sub> = 100 ×</span>
            <div className="inline-flex flex-col items-center">
              <span className="border-b-2 border-rose-400 px-2 pb-0.5 text-xs sm:text-sm text-rose-200">
                N<sub>below</sub>(AI<sub>i</sub>)
              </span>
              <span className="pt-0.5 text-xs sm:text-sm text-rose-200">
                N<sub>total</sub> − 1
              </span>
            </div>
          </div>
        </div>

        {/* Quartile Piecewise Formula */}
        <div className="bg-[#14172e] border border-gray-700 rounded-2xl p-4 space-y-2">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center border-b border-gray-800 pb-1">
            Quartile Mapping Function (Q1–Q4)
          </div>
          <div className="py-2 flex items-center justify-center font-mono text-xs sm:text-sm text-white">
            <span className="mr-3 font-bold text-amber-300 text-base">Q<sub>i</sub> =</span>
            <div className="flex items-center">
              <span className="text-3xl sm:text-4xl text-gray-400 font-light leading-none mr-2">{`{`}</span>
              <div className="space-y-1 text-[11px] sm:text-xs">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">Q1</span>
                  <span className="text-gray-300">Percentile ≥ 75</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/30">Q2</span>
                  <span className="text-gray-300">50 ≤ Percentile &lt; 75</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">Q3</span>
                  <span className="text-gray-300">25 ≤ Percentile &lt; 50</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30">Q4</span>
                  <span className="text-gray-300">Percentile &lt; 25</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 text-center italic pt-1 border-t border-gray-800/80">
            Alur evaluasi ilmiah: Formula → Score → Percentile → Quartile
          </p>
        </div>
      </div>
    </div>
  );
}
